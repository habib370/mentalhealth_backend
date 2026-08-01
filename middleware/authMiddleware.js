const jwt = require("jsonwebtoken");
const User = require("../models/user"); // 1. Fixed casing (Capital 'U')

module.exports = async (req, res, next) => {
    try {
        // 2. Read token from cookies OR Authorization header fallback
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token, authorization denied"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database
        const user = await User.findById(decoded.id || decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
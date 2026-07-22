const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token, authorization denied"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id).select("-password");
        
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
        console.error("Auth middleware error:", err);
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};
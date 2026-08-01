const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* SIGNUP */
exports.signup = async (req, res) => {
    try {
        const {
            // Step 1
            fullName,
            username,
            email,
            password,
            // Step 2
            dob,
            gender,
            city,
            religion,
            relationshipStatus,
            phone,
            bloodGroup,
            emergencyContact,
            // Step 3
            studentId,
            department,
            batch,
            course,
            level,
            term,
            cgpa,
            livingSituation,
            partTimeJob,
            // Step 4
            mentalHealthConditions,
            receivingTreatment,
            talkedWithCounselor
        } = req.body;

        // Basic required check for step 1 credentials
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                ok: false,
                message: "Full name, username, email, and password are required."
            });
        }

        // Check if user exists
        const exist = await User.findOne({ $or: [{ email }, { username }] });

        if (exist) {
            return res.status(400).json({
                ok: false,
                message: "User already exists with this email or username"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        // Create new user with all multi-step data
        const user = await User.create({
            fullName,
            username,
            email,
            password: hash,
            dob,
            gender,
            city,
            religion,
            relationshipStatus,
            phone,
            bloodGroup,
            emergencyContact,
            studentId,
            department,
            batch,
            course,
            // Store level and term only if course is BSc
            level: course === "BSc" ? level : undefined,
            term: course === "BSc" ? term : undefined,
            cgpa,
            livingSituation,
            partTimeJob,
            mentalHealthConditions,
            receivingTreatment,
            talkedWithCounselor
        });

        return res.status(201).json({
            ok: true,
            message: "User created successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({
            ok: false,
            message: "Server error"
        });
    }
};

/* LOGIN */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                ok: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // ✅ FIX: Send token in response body too
        return res.status(200).json({
            ok: true,
            message: "Login successful",
            token: token, // ✅ ADD THIS - send token in response
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            ok: false,
            message: "Server error"
        });
    }
};

/* LOGOUT */
exports.logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0)
    });

    return res.status(200).json({
        ok: true,
        message: "Logged out successfully"
    });
};
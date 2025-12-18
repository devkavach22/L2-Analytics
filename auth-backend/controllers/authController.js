import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mailServices.js";

// ====================== REGISTER ===========================
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already exists." });

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashed,
            role: role || "user"
        });

        res.json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========================= LOGIN ===========================
export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
    );

    return res.status(200).json({
        message: "Login Successful",
        id: user._id,
        name: user.name,
        email: user.email,
        token,
    });
};

// ========================= LOGOUT =============================
export const logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Logout Failed!" });
    }
};

// ===================== CHANGE PASSWORD ========================
export const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                error: "Email, old password, and new password are required."
            });
        }

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "No account found with this email." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ error: "Old password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

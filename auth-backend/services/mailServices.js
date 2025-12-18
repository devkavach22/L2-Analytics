// services/mailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { otpTemplate } from "../utils/sendEmail.js";

dotenv.config();

/*
  Required environment variables (.env):
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_app_password
*/

// ============================================================
// FIX: Use Port 587 (Standard for Cloud Hosting like Render)
// ============================================================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Explicitly define Gmail Host
  port: 587,              // Standard TLS port (Allowed by Render)
  secure: false,          // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ensure this is an APP PASSWORD, not your login password
  },
  tls: {
    rejectUnauthorized: false // Helps prevent SSL certificate errors
  }
});

/**
 * Sends a generic email using Nodemailer
 * @param {string} to - recipient email
 * @param {string} subject - subject line
 * @param {string} html - HTML email body
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Sends OTP email using prebuilt HTML template
 * @param {string} email - receiver address
 * @param {number|string} otp - generated OTP
 */
export const sendOtpEmail = async (email, otp) => {
  try {
    const html = otpTemplate(otp, email);

    await sendEmail(email, "Your OTP for Password Reset", html);
  } catch (error) {
    console.error("OTP Email Error:", error);
    throw error;
  }
};
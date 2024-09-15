import bcryptjs from "bcryptjs";
import { Generatecode } from "../utils/generatecode.js";
import { tokenandcookie } from "../utils/tokenandcookie.js";
import { User } from "../models/usermodel/user.js"; // User model import
import {
  sendmail,
  sendreset,
  sendwelcome,
  sendsuccess,
} from "../mailtrap/email.js";
import crypto from "crypto";

// Signup Handler
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Ensure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate verification code and hash the password
    const verificationCode = Generatecode();
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationtoken: verificationCode,
      verificationexpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    });

    await user.save();

    // Set token and send cookies
    tokenandcookie(res, user._id);

    // Send verification email
    await sendmail(user.email, verificationCode);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined, // Omit password from the response
      },
    });
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
    console.error("Error during signup process:", error.message);
  }
};

// Email Verification Handler
export const verifyemail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationtoken: code,
      verificationexpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Update user's verification status
    user.isverified = true;
    user.verificationtoken = undefined;
    user.verificationexpires = undefined;
    await user.save();

    await sendwelcome(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined, // Do not expose the password in the response
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Login Handler
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Set token and send cookies
    tokenandcookie(res, user._id);
    user.lastlogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Logout Handler
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Forgot Password Handler
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(10).toString("hex");
    const resetExpire = Date.now() + 1 * 60 * 60 * 1000; // 1-hour expiry

    user.resetpasswordtoken = resetToken;
    user.resetpasswordexpires = resetExpire;
    await user.save();

    // Send reset email
    await sendreset(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).json({ success: true, message: "Reset link sent" });
  } catch (error) {
    console.error("Error during forgot password:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Reset Password Handler
export const resetpassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetpasswordtoken: token,
      resetpasswordexpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetpasswordtoken = undefined;
    user.resetpasswordexpires = undefined;
    await user.save();

    await sendsuccess(user.email);

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Auth Check Handler
export const checkauth = async (req, res) => {
  try {
    // Check if req.userId is available
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID provided",
      });
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error checking auth:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

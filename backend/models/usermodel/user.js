import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastlogin: {
      type: Date,
      default: Date.now,  // Automatically set to the current date if not provided
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    resetpasswordtoken: {
      type: String,
    },
    resetpasswordexpires: {
      type: Date,
    },
    verificationtoken: {
      type: String,
    },
    verificationexpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

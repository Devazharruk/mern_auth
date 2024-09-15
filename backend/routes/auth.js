import express from "express";
import {
  login,
  logout,
  signup,
  verifyemail,
  forgotPassword,
  resetpassword,
  checkauth
} from "../controlers/auth.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkauth);

router.post("/signup", signup);
router.post("/verify-email", verifyemail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetpassword);

export default router;

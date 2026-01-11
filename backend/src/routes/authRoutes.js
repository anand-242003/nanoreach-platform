import express from "express";
import rateLimit from "express-rate-limit";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3,
  message: 'Too many accounts created, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);

router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
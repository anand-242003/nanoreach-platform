import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
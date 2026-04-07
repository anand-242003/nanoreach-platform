import express from "express";
import { protect, requireBrand } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import {
  createBrandProfile,
  updateBrandProfile,
  getMyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/profile", protect, requireBrand, upload.single('document'), createBrandProfile);
router.put("/profile", protect, requireBrand, upload.single('document'), updateBrandProfile);
router.get("/profile", protect, requireBrand, getMyProfile);

export default router;

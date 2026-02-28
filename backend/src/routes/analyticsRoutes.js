import express from "express";
import { protect, requireInfluencer, requireBrand } from "../middlewares/authMiddleware.js";
import {
  getInfluencerAnalytics,
  getBrandAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/influencer", protect, requireInfluencer, getInfluencerAnalytics);

router.get("/brand", protect, requireBrand, getBrandAnalytics);

export default router;

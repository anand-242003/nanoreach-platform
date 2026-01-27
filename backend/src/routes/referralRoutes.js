import express from "express";
import { protect, requireInfluencer, requireAdmin } from "../middlewares/authMiddleware.js";
import { trackClick, getMyReferralStats, trackConversion } from "../controllers/referralController.js";

const router = express.Router();

router.get("/r/:code", trackClick);
router.get("/my-stats", protect, requireInfluencer, getMyReferralStats);
router.post("/:code/conversion", protect, requireAdmin, trackConversion);

export default router;

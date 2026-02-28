import express from "express";
import { protect, requireInfluencer, requireAdmin } from "../middlewares/authMiddleware.js";
import { 
  trackClick, 
  getMyReferralStats, 
  getCampaignReferralStats,
  trackConversion,
  getReferralLinkInfo,
} from "../controllers/referralController.js";

const router = express.Router();

router.get("/r/:code", trackClick);

router.get("/my-stats", protect, requireInfluencer, getMyReferralStats);
router.get("/campaign/:campaignId/stats", protect, requireInfluencer, getCampaignReferralStats);

router.get("/info/:code", protect, getReferralLinkInfo);

router.post("/:code/conversion", protect, requireAdmin, trackConversion);

export default router;

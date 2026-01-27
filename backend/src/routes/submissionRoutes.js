import express from "express";
import { protect, requireInfluencer, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  createSubmission,
  getMySubmissions,
  getCampaignSubmissions,
  scoreSubmission,
  getCampaignLeaderboard,
  getSubmissionWindowStatus,
  revealLeaderboard,
  getInfluencerFeedback,
} from "../controllers/submissionController.js";

const router = express.Router();

// Influencer routes
router.post("/", protect, requireInfluencer, createSubmission);
router.get("/my", protect, requireInfluencer, getMySubmissions);
router.get("/campaign/:campaignId/window", protect, requireInfluencer, getSubmissionWindowStatus);
router.get("/campaign/:campaignId/leaderboard", protect, getCampaignLeaderboard);
router.get("/campaign/:campaignId", protect, getCampaignSubmissions);
router.get("/:submissionId/feedback", protect, requireInfluencer, getInfluencerFeedback);

// Admin routes
router.post("/:submissionId/score", protect, requireAdmin, scoreSubmission);
router.post("/campaign/:campaignId/reveal", protect, requireAdmin, revealLeaderboard);

export default router;

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
  updateSubmissionMetrics,
  validateSubmission,
  flagSubmission,
  getPendingSubmissions,
  reverifySubmission,
  getAdminFraudAlerts,
  reviewAdminFraudAlert,
  getVerificationHistory,
} from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", protect, requireInfluencer, createSubmission);
router.get("/my", protect, requireInfluencer, getMySubmissions);
router.get("/campaign/:campaignId/window", protect, requireInfluencer, getSubmissionWindowStatus);
router.get("/campaign/:campaignId/leaderboard", protect, getCampaignLeaderboard);
router.get("/campaign/:campaignId", protect, getCampaignSubmissions);
router.get("/:submissionId/feedback", protect, requireInfluencer, getInfluencerFeedback);

router.get("/admin/pending", protect, requireAdmin, getPendingSubmissions);
router.put("/admin/:id/metrics", protect, requireAdmin, updateSubmissionMetrics);
router.post("/admin/:id/validate", protect, requireAdmin, validateSubmission);
router.post("/admin/:id/flag", protect, requireAdmin, flagSubmission);

router.post("/admin/:id/verify", protect, requireAdmin, reverifySubmission);
router.get("/admin/fraud-alerts", protect, requireAdmin, getAdminFraudAlerts);
router.post("/admin/fraud-alerts/:id/review", protect, requireAdmin, reviewAdminFraudAlert);
router.get("/admin/:id/verification-history", protect, requireAdmin, getVerificationHistory);

router.post("/admin/:id/score", protect, requireAdmin, scoreSubmission);
router.post("/admin/campaign/:campaignId/reveal", protect, requireAdmin, revealLeaderboard);

export default router;

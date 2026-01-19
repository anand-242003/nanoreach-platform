import express from "express";
import { createCampaign, getAllCampaigns, getCampaignById, getMyCampaigns, updateCampaign } from "../controllers/campaignController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { getCampaignSubmissions } from "../controllers/submissionController.js";

const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/my", authenticate, authorize("BRAND"), getMyCampaigns);
router.get("/:id", getCampaignById);
router.get("/:id/submissions", authenticate, authorize("BRAND"), getCampaignSubmissions);

router.post("/", authenticate, authorize("BRAND"), createCampaign);
router.put("/:id", authenticate, authorize("BRAND"), updateCampaign);

export default router;
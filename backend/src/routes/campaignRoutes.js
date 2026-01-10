import express from "express";
import { createCampaign, getAllCampaigns } from "../controllers/campaignController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCampaigns);


router.post("/", authenticate, authorize("BRAND"), createCampaign);

export default router;
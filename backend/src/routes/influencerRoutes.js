import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createOrUpdateProfile,
  addSocialLinks,
  uploadDocuments,
  addPastWork,
  submitForVerification,
  getMyProfile,
} from "../controllers/influencerProfileController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/profile", protect, createOrUpdateProfile);
router.post("/profile/social", protect, addSocialLinks);
router.post("/profile/documents", protect, upload.single('document'), uploadDocuments);
router.post("/profile/work", protect, addPastWork);
router.post("/submit-verification", protect, submitForVerification);
router.get("/profile", protect, getMyProfile);

export default router;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import influencerRoutes from "./routes/influencerRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import escrowRoutes from "./routes/escrowRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import prisma from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);
const vercelPreviewPattern = /^https:\/\/nanoreach-[a-z0-9-]+-anands-projects-[a-z0-9]+\.vercel\.app$/;

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/influencer", influencerRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/referral", referralRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  if (err?.message?.includes('Not allowed by CORS')) {
    return res.status(403).json({ message: 'CORS blocked this origin' });
  }
  res.status(500).json({ message: "Internal server error" });
});

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {}
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {}

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database during startup', error?.message || error);
    process.exit(1);
  }
};

startServer();


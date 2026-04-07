import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

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

const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- ROUTES ---------------- */
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

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  if (err?.message?.includes("Not allowed by CORS")) {
    return res.status(403).json({ message: "CORS blocked this origin" });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

/* ---------------- ENV VALIDATION ---------------- */
const requiredEnvVars = [
  "JWT_SECRET",
  "DATABASE_URL",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_BUCKET_NAME",
];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error("Missing env vars:", missingEnvVars);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn("⚠️ JWT_SECRET should be at least 32 characters long");
}

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`✅ API running on port ${PORT}`);
      console.log(`🌐 Allowed origin: ${allowedOrigin}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import { authenticate } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/', (_req, res) => {
  res.send('DRK/MTTR API is running');
});

// Debug endpoint to check auth
app.get('/api/debug/auth', authenticate, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

export default app;

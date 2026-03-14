import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import escrowRoutes from './routes/escrowRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import { authenticate } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// FRONTEND_URL supports comma-separated values for multiple Vercel/preview URLs
const allowedOrigins = [
  ...(process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(u => u.trim()),
  'http://localhost:5174',
];

// Matches any Vercel preview deployment for this project:
// e.g. https://nanoreach-abc123-anands-projects-0e94119a.vercel.app
const vercelPreviewPattern = /^https:\/\/nanoreach-[a-z0-9-]+-anands-projects-[a-z0-9]+\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: 'Too many requests, please try again later', retryAfter: 900 },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: 'Too many authentication attempts, please try again later', retryAfter: 900 },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: { message: 'Rate limit exceeded for sensitive operations', retryAfter: 3600 },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000 || res.statusCode >= 400) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authLimiter, authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/escrow', sensitiveOpLimiter, escrowRoutes);
app.use('/api/admin', sensitiveOpLimiter, adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/referral', referralRoutes);

app.get('/', (_req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'DRK/MTTR API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/auth', authenticate, (req, res) => {
    res.json({
      authenticated: true,
      user: req.user
    });
  });
}

app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ message: 'An error occurred' });
  } else {
    res.status(err.status || 500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;

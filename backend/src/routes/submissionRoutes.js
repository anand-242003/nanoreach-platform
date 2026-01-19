import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  createSubmission, 
  getMySubmissions,
  approveSubmission,
  rejectSubmission
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Only images, videos, and PDFs are accepted.`));
    }
  }
});

router.post('/', authenticate, authorize('CREATOR'), (req, res, next) => {
  const uploadMiddleware = upload.array('files', 10);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err.message.includes('not allowed')) {
        req.files = [];
        return next();
      }
      return res.status(400).json({ 
        message: 'File upload error', 
        error: err.message 
      });
    }
    next();
  });
}, createSubmission);

router.get('/my', authenticate, authorize('CREATOR'), getMySubmissions);

router.put('/:id/approve', authenticate, authorize('BRAND'), approveSubmission);

router.put('/:id/reject', authenticate, authorize('BRAND'), rejectSubmission);

export default router;

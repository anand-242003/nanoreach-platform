import express from 'express';
import { 
  createSubmission, 
  getMySubmissions,
  updateSubmissionStatus
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorize('CREATOR'), createSubmission);

router.get('/my', authenticate, authorize('CREATOR'), getMySubmissions);

router.patch('/:id/status', authenticate, authorize('BRAND'), updateSubmissionStatus);

export default router;

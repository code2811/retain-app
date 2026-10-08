import express from 'express';
import { getPlatformInsights } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Admin insights
router.get('/insights', getPlatformInsights);

export default router;
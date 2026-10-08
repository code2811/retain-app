import express from 'express';
import { body } from 'express-validator';
import { getBudget, setBudget, getBudgetSummary } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const budgetValidation = [
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
];

// Routes
router.get('/', getBudget);
router.post('/', budgetValidation, setBudget);
router.get('/summary', getBudgetSummary);

export default router;
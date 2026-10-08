import express from 'express';
import { body } from 'express-validator';
import { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const expenseValidation = [
  body('title').notEmpty().trim().isLength({ max: 100 }),
  body('amount').isFloat({ min: 0.01 }),
  body('category').notEmpty().trim(),
  body('date').isISO8601().toDate(),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'mobile_money']),
  body('description').optional().trim().isLength({ max: 500 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

// Routes
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', expenseValidation, createExpense);
router.put('/:id', expenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

export default router;
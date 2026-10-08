import express from 'express';
import { body } from 'express-validator';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const categoryValidation = [
  body('name').notEmpty().trim().isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 200 }),
];

// Public route - get all categories
router.get('/', getCategories);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', categoryValidation, createCategory);
router.put('/:id', categoryValidation, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
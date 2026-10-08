import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Expense from '../models/Expense';
import { ICategoryInput } from '../interfaces/category.interface';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request<{}, {}, ICategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, {}, ICategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    // Check if this is the "Uncategorized" category
    if (category.name.toLowerCase() === 'uncategorized') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the default Uncategorized category',
      });
    }

    // Find or create default "Uncategorized" category
    let defaultCategory = await Category.findOne({ name: 'Uncategorized' });
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'Uncategorized',
        description: 'Default category for uncategorized expenses',
      });
    }

    // Move all expenses from deleted category to "Uncategorized"
    await Expense.updateMany(
      { category: category.name },
      { category: 'Uncategorized' }
    );

    // Delete the category
    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: `Category deleted. All expenses moved to "Uncategorized".`,
    });
  } catch (error) {
    next(error);
  }
};
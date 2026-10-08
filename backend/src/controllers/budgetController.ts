import { Request, Response, NextFunction } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import { IBudgetInput, IBudgetSummary } from '../interfaces/budget.interface';

export const getBudget = async (
  req: Request<{}, {}, {}, { month?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    const budget = await Budget.findOne({
      user: req.user?._id,
      month: currentMonth,
    });

    res.status(200).json({
      success: true,
      data: budget || null,
    });
  } catch (error) {
    next(error);
  }
};

export const setBudget = async (
  req: Request<{}, {}, IBudgetInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { month, amount } = req.body;

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format',
      });
    }

    // Create or update budget
    const budget = await Budget.findOneAndUpdate(
      { user: req.user?._id, month },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetSummary = async (
  req: Request<{}, {}, {}, { month?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    // Get budget for the month
    const budget = await Budget.findOne({
      user: req.user?._id,
      month: currentMonth,
    });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: {
          budget: 0,
          spent: 0,
          remaining: 0,
          status: 'within',
          percentage: 0,
        },
      });
    }

    // Calculate total spent for the month
    const startDate = new Date(currentMonth + '-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    const expenses = await Expense.find({
      user: req.user?._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    // Determine status
    let status: 'within' | 'approaching' | 'over' = 'within';
    if (percentage >= 100) {
      status = 'over';
    } else if (percentage >= 80) {
      status = 'approaching';
    }

    const summary: IBudgetSummary = {
      budget: budget.amount,
      spent,
      remaining,
      status,
      percentage,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
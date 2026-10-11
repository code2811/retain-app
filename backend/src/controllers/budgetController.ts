import { Request, Response, NextFunction } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import { IBudgetInput, IBudgetSummary } from '../interfaces/budget.interface';

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

const getMonthBounds = (month: string): { start: Date; end: Date } => {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
};

export const getBudget = async (
  req: Request<{}, {}, {}, { month?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    if (!monthPattern.test(currentMonth)) {
      res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format',
      });
      return;
    }

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
    if (!monthPattern.test(month)) {
      res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format',
      });
      return;
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

    if (!monthPattern.test(currentMonth)) {
      res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format',
      });
      return;
    }

    // Get budget for the month
    const budget = await Budget.findOne({
      user: req.user?._id,
      month: currentMonth,
    });

    if (!budget) {
      res.status(200).json({
        success: true,
        data: {
          budget: 0,
          spent: 0,
          remaining: 0,
          status: 'within',
          percentage: 0,
        },
      });
      return;
    }

    // Calculate total spent for the month
    const { start: startDate, end: endDate } = getMonthBounds(currentMonth);

    const expenses = await Expense.find({
      user: req.user?._id,
      date: { $gte: startDate, $lt: endDate },
    });

    const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : spent > 0 ? 100 : 0;

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
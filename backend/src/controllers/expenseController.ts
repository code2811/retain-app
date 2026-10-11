import { Request, Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import Expense from '../models/Expense';
import { IExpense, IExpenseInput, IExpenseQuery } from '../interfaces/expense.interface';

interface ExpenseSummaryQuery {
  month?: string;
}

export const getExpenseSummary = async (
  req: Request<{}, {}, {}, ExpenseSummaryQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format',
      });
      return;
    }

    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNumber, 1));
    const expenses = await Expense.find({
      user: req.user?._id,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
    const highestExpense = expenses.reduce(
      (highest, expense) => Math.max(highest, expense.amount),
      0
    );
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const categorySpending = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalSpent === 0 ? 0 : (total / totalSpent) * 100,
      }))
      .sort((first, second) => second.total - first.total);

    const recentExpenses = expenses.slice(0, 5).map((expense) => ({
      ...expense.toObject(),
      id: expense._id.toString(),
      userId: expense.user.toString(),
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSpent,
        highestExpense,
        categorySpending,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (
  req: Request<{}, {}, {}, IExpenseQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: FilterQuery<IExpense> = { user: req.user?._id };

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = minAmount;
      if (maxAmount !== undefined) query.amount.$lte = maxAmount;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort
    const sort: Partial<Record<'date' | 'amount', 1 | -1>> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (
  req: Request<{}, {}, IExpenseInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
  req: Request<{ id: string }, {}, IExpenseInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
      return;
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
      return;
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
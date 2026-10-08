import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Expense from '../models/Expense';
import Category from '../models/Category';
import { ICategoryStats } from '../interfaces/category.interface';

export const getPlatformInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get current month for calculations
    const currentMonth = new Date().toISOString().slice(0, 7);
    const startOfMonth = new Date(currentMonth + '-01');
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(endOfMonth.getDate() - 1);

    // Total users
    const totalUsers = await User.countDocuments();

    // Total expenses and value
    const totalExpenses = await Expense.countDocuments();
    const totalExpenseValue = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Current month expenses
    const currentMonthExpenses = await Expense.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Spending per category
    const categorySpending = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Top 5 and bottom 5 categories by usage count
    const categoryUsage = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topCategories = categoryUsage.slice(0, 5);
    const bottomCategories = categoryUsage.slice(-5).reverse();

    // Recent expenses (last 10)
    const recentExpenses = await Expense.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt');

    // Format category spending
    const formattedCategorySpending: ICategoryStats[] = categorySpending.map(item => ({
      category: item._id,
      total: item.total,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalExpenses,
        totalExpenseValue: totalExpenseValue[0]?.total || 0,
        currentMonthExpenses,
        categorySpending: formattedCategorySpending,
        topCategories: topCategories.map(item => ({
          category: item._id,
          count: item.count,
        })),
        bottomCategories: bottomCategories.map(item => ({
          category: item._id,
          count: item.count,
        })),
        recentExpenses,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
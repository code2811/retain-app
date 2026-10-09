import type { Expense } from './expense.types';

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM format
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  month: string;
  amount: number;
}

export type BudgetStatus = 'within' | 'approaching' | 'over';

export interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
  percentage: number;
}

export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
}

export interface DashboardData {
  totalSpent: number;
  remainingBudget: number;
  highestExpense: number;
  categorySpending: CategorySpending[];
  recentExpenses: Expense[];
  budgetSummary: BudgetSummary;
}
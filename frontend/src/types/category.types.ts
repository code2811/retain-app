export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  currentMonthExpenses: number;
  categorySpending: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  bottomCategories: Array<{
    category: string;
    count: number;
  }>;
  recentExpenses: Expense[];
  recentUsers: User[];
}
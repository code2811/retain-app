export interface Expense {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  notes?: string;
}

export interface ExpenseFilters {
  search: string;
  category: string;
  paymentMethod: string;
  startDate: string | null;
  endDate: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface ExpensesResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}
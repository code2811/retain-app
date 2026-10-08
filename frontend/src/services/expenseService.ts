import api from './api';
import { Expense, ExpenseFormData, ExpensesResponse, ExpenseFilters } from '../types/expense.types';

export const expenseService = {
  async getExpenses(filters: ExpenseFilters, page: number = 1, limit: number = 10): Promise<ExpensesResponse> {
    const params = new URLSearchParams();
    
    // Add filter params
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minAmount !== null) params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount !== null) params.append('maxAmount', filters.maxAmount.toString());
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  },

  async getExpense(id: string): Promise<{ success: boolean; data: Expense }> {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  async createExpense(expenseData: ExpenseFormData): Promise<{ success: boolean; data: Expense }> {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  async updateExpense(id: string, expenseData: ExpenseFormData): Promise<{ success: boolean; data: Expense }> {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  async deleteExpense(id: string): Promise<{ success: boolean; data: {} }> {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};
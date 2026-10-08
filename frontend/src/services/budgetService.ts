import api from './api';
import { Budget, BudgetFormData, BudgetSummary } from '../types/budget.types';

export const budgetService = {
  async getBudget(month?: string): Promise<{ success: boolean; data: Budget | null }> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  },

  async setBudget(budgetData: BudgetFormData): Promise<{ success: boolean; data: Budget }> {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  async getBudgetSummary(month?: string): Promise<{ success: boolean; data: BudgetSummary }> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await api.get(`/budgets/summary?${params.toString()}`);
    return response.data;
  },
};
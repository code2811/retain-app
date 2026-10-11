import api from './api';
import type { AdminInsights } from '../types/category.types';

export const adminService = {
  async getInsights(): Promise<{ success: boolean; data: AdminInsights }> {
    const response = await api.get('/admin/insights');
    return response.data;
  },
};

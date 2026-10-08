import api from './api';
import { Category, CategoryFormData } from '../types/category.types';

export const categoryService = {
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    const response = await api.get('/categories');
    return response.data;
  },

  async createCategory(categoryData: CategoryFormData): Promise<{ success: boolean; data: Category }> {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  async updateCategory(id: string, categoryData: CategoryFormData): Promise<{ success: boolean; data: Category }> {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; data: {}; message?: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
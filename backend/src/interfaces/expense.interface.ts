import { Document, Types } from 'mongoose';

export interface IExpense extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseInput {
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  notes?: string;
}

export interface IExpenseQuery {
  search?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
import { Document, Types } from 'mongoose';

export interface IBudget extends Document {
  user: Types.ObjectId;
  month: string; // YYYY-MM format
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudgetInput {
  month: string;
  amount: number;
}

export interface IBudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
  status: 'within' | 'approaching' | 'over';
  percentage: number;
}
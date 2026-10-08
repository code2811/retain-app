import { Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryInput {
  name: string;
  description?: string;
}

export interface ICategoryStats {
  category: string;
  total: number;
  count: number;
}
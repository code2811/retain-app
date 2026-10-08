import mongoose, { Schema } from 'mongoose';
import { IBudget } from '../interfaces/budget.interface';

const budgetSchema = new Schema<IBudget>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one budget per user per month
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

const Budget = mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget;
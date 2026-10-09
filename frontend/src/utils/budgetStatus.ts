import type { BudgetStatus } from '../types/budget.types';

export interface BudgetStatusResult {
  status: BudgetStatus;
  percentage: number;
}

export const getBudgetStatus = (spent: number, budget: number): BudgetStatusResult => {
  if (budget <= 0) {
    return { status: 'within', percentage: 0 };
  }

  const percentage = (spent / budget) * 100;
  const status: BudgetStatus = percentage > 100
    ? 'over'
    : percentage >= 80
      ? 'approaching'
      : 'within';

  return { status, percentage };
};

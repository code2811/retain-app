import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExpenseFilters } from '../../types/expense.types';

const initialState: ExpenseFilters = {
  search: '',
  category: '',
  paymentMethod: '',
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
  sortBy: 'date',
  sortOrder: 'desc',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setAmountRange: (state, action: PayloadAction<{ minAmount: number | null; maxAmount: number | null }>) => {
      state.minAmount = action.payload.minAmount;
      state.maxAmount = action.payload.maxAmount;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'amount'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateRange,
  setAmountRange,
  setSortBy,
  setSortOrder,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
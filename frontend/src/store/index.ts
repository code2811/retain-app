import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
  reducer: {
    filters: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['filters/setDateRange', 'filters/setAmountRange'],
        ignoredPaths: ['filters.startDate', 'filters.endDate', 'filters.minAmount', 'filters.maxAmount'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
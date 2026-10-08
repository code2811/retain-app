import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateRange,
  setAmountRange,
  setSortBy,
  setSortOrder,
  resetFilters,
} from '../../store/slices/filterSlice';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/category.types';

const FilterSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [minAmount, setMinAmount] = useState<string>(filters.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState<string>(filters.maxAmount?.toString() || '');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCategory(e.target.value));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPaymentMethod(e.target.value));
  };

  const handleStartDateChange = (date: Date | null) => {
    dispatch(setDateRange({
      startDate: date ? date.toISOString().split('T')[0] : null,
      endDate: filters.endDate,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    dispatch(setDateRange({
      startDate: filters.startDate,
      endDate: date ? date.toISOString().split('T')[0] : null,
    }));
  };

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinAmount(value);
    if (value === '') {
      dispatch(setAmountRange({ minAmount: null, maxAmount: filters.maxAmount }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        dispatch(setAmountRange({ minAmount: numValue, maxAmount: filters.maxAmount }));
      }
    }
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxAmount(value);
    if (value === '') {
      dispatch(setAmountRange({ minAmount: filters.minAmount, maxAmount: null }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        dispatch(setAmountRange({ minAmount: filters.minAmount, maxAmount: numValue }));
      }
    }
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSortBy(e.target.value as 'date' | 'amount'));
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSortOrder(e.target.value as 'asc' | 'desc'));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setMinAmount('');
    setMaxAmount('');
  };

  const paymentMethods = [
    { value: '', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  return (
    <Paper sx={{ width: 300, p: 2, height: 'fit-content' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">Filters</Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Search */}
        <TextField
          fullWidth
          label="Search"
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => dispatch(setSearch(''))}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Category */}
        <TextField
          fullWidth
          select
          label="Category"
          value={filters.category}
          onChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Payment Method */}
        <TextField
          fullWidth
          select
          label="Payment Method"
          value={filters.paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          {paymentMethods.map((method) => (
            <MenuItem key={method.value} value={method.value}>
              {method.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Date Range */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={filters.startDate ? new Date(filters.startDate) : null}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
          <DatePicker
            label="End Date"
            value={filters.endDate ? new Date(filters.endDate) : null}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </LocalizationProvider>

        {/* Amount Range */}
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            label="Min Amount"
            type="number"
            value={minAmount}
            onChange={handleMinAmountChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          <TextField
            fullWidth
            label="Max Amount"
            type="number"
            value={maxAmount}
            onChange={handleMaxAmountChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Box>

        {/* Sort By */}
        <TextField
          fullWidth
          select
          label="Sort By"
          value={filters.sortBy}
          onChange={handleSortByChange}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Sort Order */}
        <TextField
          fullWidth
          select
          label="Sort Order"
          value={filters.sortOrder}
          onChange={handleSortOrderChange}
        >
          {sortOrderOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Reset Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleResetFilters}
          startIcon={<Clear />}
        >
          Reset Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterSidebar;
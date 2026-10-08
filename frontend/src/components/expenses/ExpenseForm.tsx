import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { Expense, ExpenseFormData } from '../../types/expense.types';
import { Category } from '../../types/category.types';

const schema = yup.object({
  title: yup.string().required('Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
  amount: yup.number().required('Amount is required').min(0.01, 'Amount must be greater than 0'),
  category: yup.string().required('Category is required'),
  date: yup.date().required('Date is required'),
  paymentMethod: yup.string().oneOf(['cash', 'card', 'bank_transfer', 'mobile_money']).required('Payment method is required'),
  notes: yup.string().max(1000, 'Notes cannot exceed 1000 characters'),
});

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose, onSuccess, expense }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: '',
    },
  });

  const dateValue = watch('date');

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount,
        category: expense.category,
        date: expense.date.split('T')[0],
        paymentMethod: expense.paymentMethod,
        notes: expense.notes || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: '',
      });
    }
  }, [expense, reset]);

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

    if (open) {
      loadCategories();
    }
  }, [open]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      setError('');

      if (expense) {
        await expenseService.updateExpense(expense.id, data);
      } else {
        await expenseService.createExpense(data);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setValue('date', date.toISOString().split('T')[0]);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {expense ? 'Edit Expense' : 'Add New Expense'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title *"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
            margin="normal"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
            disabled={loading}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Amount *"
              type="number"
              inputProps={{ step: '0.01', min: '0.01' }}
              {...register('amount')}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              disabled={loading}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date *"
                value={dateValue ? new Date(dateValue) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date?.message,
                    disabled: loading,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              select
              label="Category *"
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={loading || categoriesLoading}
            >
              {categoriesLoading ? (
                <MenuItem disabled>Loading categories...</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              select
              label="Payment Method *"
              {...register('paymentMethod')}
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod?.message}
              disabled={loading}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            {...register('notes')}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            margin="normal"
            disabled={loading}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : expense ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;
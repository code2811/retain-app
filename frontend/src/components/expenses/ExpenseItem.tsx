import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { Expense } from '../../types/expense.types';

interface ExpenseItemProps {
  expense: Expense;
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'default';
      case 'card': return 'primary';
      case 'bank_transfer': return 'secondary';
      case 'mobile_money': return 'success';
      default: return 'default';
    }
  };

  return (
    <TableRow hover>
      <TableCell>{formatDate(expense.date)}</TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {expense.title}
        </Typography>
        {expense.description && (
          <Typography variant="caption" color="textSecondary">
            {expense.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip label={expense.category} size="small" />
      </TableCell>
      <TableCell>
        <Typography color="error" fontWeight="bold">
          {formatCurrency(expense.amount)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={expense.paymentMethod.replace('_', ' ')}
          size="small"
          color={getPaymentMethodColor(expense.paymentMethod)}
          variant="outlined"
        />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={() => onView(expense)}>
          <Visibility fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(expense)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(expense.id)}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ExpenseItem;
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Expense } from '../../types/expense.types';

interface ExpenseDetailProps {
  open: boolean;
  onClose: () => void;
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseDetail: React.FC<ExpenseDetailProps> = ({
  open,
  onClose,
  expense,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{expense.title}</Typography>
          <Chip
            label={formatCurrency(expense.amount)}
            color="error"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Category
          </Typography>
          <Chip label={expense.category} size="small" />
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Date
          </Typography>
          <Typography>{formatDate(expense.date)}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Payment Method
          </Typography>
          <Chip
            label={formatPaymentMethod(expense.paymentMethod)}
            color={getPaymentMethodColor(expense.paymentMethod)}
            variant="outlined"
            size="small"
          />
        </Box>

        {expense.description && (
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Description
            </Typography>
            <Typography>{expense.description}</Typography>
          </Box>
        )}

        {expense.notes && (
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Notes
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2">{expense.notes}</Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Additional Information
          </Typography>
          <Box display="flex" gap={3}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(expense.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {new Date(expense.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<Delete />}
          onClick={onDelete}
          color="error"
          variant="outlined"
        >
          Delete
        </Button>
        <Button
          startIcon={<Edit />}
          onClick={onEdit}
          variant="contained"
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDetail;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { expenseService } from '../../services/expenseService';
import type { Expense } from '../../types/expense.types';
import ExpenseForm from './ExpenseForm';
import ExpenseDetail from './ExpenseDetail';
import ExpenseItem from './ExpenseItem';
import FilterSidebar from '../filters/FilterSidebar';

interface ApiErrorResponse {
  error?: string;
}

const Expenses: React.FC = () => {
  const filters = useAppSelector((state) => state.filters);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await expenseService.getExpenses(filters, page + 1, rowsPerPage);
      setExpenses(response.data.expenses);
      setTotal(response.data.pagination.total);
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiErrorResponse>(err) ? err.response?.data?.error : undefined;
      setError(message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filters, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetail(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        loadExpenses();
      } catch (err: unknown) {
        const message = axios.isAxiosError<ApiErrorResponse>(err) ? err.response?.data?.error : undefined;
        setError(message || 'Failed to delete expense');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadExpenses();
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Filter Sidebar */}
      <FilterSidebar mobileOpen={filtersOpen} onMobileClose={() => setFiltersOpen(false)} />

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 3, gap: 2 }}>
          <Typography variant="h4">Expenses</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<FilterList />} onClick={() => setFiltersOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              Filters
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)}>
              Add Expense
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          No expenses found. {filters.search ? 'Try a different search.' : 'Add your first expense!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Box>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          open={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          expense={editingExpense}
        />
      )}

      {/* Expense Detail Modal */}
      {showDetail && selectedExpense && (
        <ExpenseDetail
          open={showDetail}
          onClose={() => setShowDetail(false)}
          expense={selectedExpense}
          onEdit={() => {
            setShowDetail(false);
            handleEdit(selectedExpense);
          }}
          onDelete={() => {
            setShowDetail(false);
            handleDelete(selectedExpense.id);
          }}
        />
      )}
    </Box>
  );
};

export default Expenses;
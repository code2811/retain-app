import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { AccountBalanceWallet, Category, Save } from '@mui/icons-material';
import { budgetService } from '../../services/budgetService';
import { expenseService } from '../../services/expenseService';
import type { Budget, DashboardData, BudgetStatus } from '../../types/budget.types';
import { getBudgetStatus } from '../../utils/budgetStatus';

interface ApiErrorResponse {
  error?: string;
}

const currentMonth = new Date().toISOString().slice(0, 7);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error || fallback;
  }
  return fallback;
};

const getStatusColor = (status: BudgetStatus): 'success' | 'warning' | 'error' => {
  if (status === 'over') return 'error';
  if (status === 'approaching') return 'warning';
  return 'success';
};

const getStatusText = (status: BudgetStatus): string => {
  if (status === 'over') return 'Over Budget';
  if (status === 'approaching') return 'Approaching Limit';
  return 'Within Budget';
};

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const [budgetResponse, expenseResponse] = await Promise.all([
          budgetService.getBudget(selectedMonth),
          expenseService.getExpenseSummary(selectedMonth),
        ]);

        const currentBudget = budgetResponse.data;
        const summary = expenseResponse.data;
        const statusResult = getBudgetStatus(summary.totalSpent, currentBudget?.amount || 0);
        const budgetSummary = currentBudget
          ? {
              budget: currentBudget.amount,
              spent: summary.totalSpent,
              remaining: currentBudget.amount - summary.totalSpent,
              status: statusResult.status,
              percentage: statusResult.percentage,
            }
          : {
              budget: 0,
              spent: summary.totalSpent,
              remaining: 0,
              status: 'within' as const,
              percentage: 0,
            };

        setBudget(currentBudget);
        setBudgetAmount(currentBudget?.amount.toString() || '');
        setDashboardData({
          totalSpent: summary.totalSpent,
          remainingBudget: budgetSummary.remaining,
          highestExpense: summary.highestExpense,
          categorySpending: summary.categorySpending,
          recentExpenses: summary.recentExpenses,
          budgetSummary,
        });
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError, 'Failed to load dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [selectedMonth, reloadKey]);

  const handleBudgetSave = async () => {
    const amount = Number(budgetAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Budget must be a valid non-negative amount');
      return;
    }

    try {
      setSavingBudget(true);
      setError('');
      await budgetService.setBudget({ month: selectedMonth, amount });
      setReloadKey((value) => value + 1);
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, 'Failed to save budget'));
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return <Alert severity="error">{error || 'Dashboard data is unavailable'}</Alert>;
  }

  const { budgetSummary } = dashboardData;
  const hasBudget = budget !== null;
  const statusColor = hasBudget ? getStatusColor(budgetSummary.status) : 'info';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body1" color="textSecondary">
            Your spending overview for the selected month.
          </Typography>
        </Box>
        <TextField
          label="Month"
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value || currentMonth)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Budget Status</Typography>
              </Box>

              {!hasBudget ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No budget set for {selectedMonth}.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Monthly budget: {formatCurrency(budgetSummary.budget)}
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(dashboardData.totalSpent)} / {formatCurrency(budgetSummary.budget)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budgetSummary.percentage, 100)}
                      color={statusColor}
                      sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2">{budgetSummary.percentage.toFixed(1)}%</Typography>
                  </Box>
                  <Typography variant="body1" color={`${statusColor}.main`} sx={{ fontWeight: 'bold' }}>
                    {getStatusText(budgetSummary.status)}
                  </Typography>
                </>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Monthly budget"
                  type="number"
                  value={budgetAmount}
                  onChange={(event) => setBudgetAmount(event.target.value)}
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => void handleBudgetSave()}
                  disabled={savingBudget}
                >
                  {savingBudget ? 'Saving' : 'Save'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Category sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Spending by Category</Typography>
              </Box>
              {dashboardData.categorySpending.length === 0 ? (
                <Typography color="textSecondary">No expenses recorded this month.</Typography>
              ) : (
                <List>
                  {dashboardData.categorySpending.map((item, index) => (
                    <React.Fragment key={item.category}>
                      <ListItem>
                        <ListItemText
                          primary={item.category}
                          secondary={`${formatCurrency(item.total)} (${item.percentage.toFixed(1)}%)`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                      </ListItem>
                      {index < dashboardData.categorySpending.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Spent</Typography>
              <Typography variant="h4" color="error">{formatCurrency(dashboardData.totalSpent)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Highest Expense</Typography>
              <Typography variant="h4">{formatCurrency(dashboardData.highestExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Expenses</Typography>
              {dashboardData.recentExpenses.length === 0 ? (
                <Typography color="textSecondary">No expenses recorded this month.</Typography>
              ) : (
                <List>
                  {dashboardData.recentExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <ListItem>
                        <ListItemText
                          primary={expense.title}
                          secondary={`${expense.category} - ${new Date(expense.date).toLocaleDateString()}`}
                        />
                        <Typography variant="h6" color="error">{formatCurrency(expense.amount)}</Typography>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

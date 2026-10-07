import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Category,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Mock data for now - will be replaced with real API calls
  const dashboardData = {
    totalSpent: 1250.75,
    remainingBudget: 749.25,
    budget: 2000,
    highestExpense: 350,
    status: 'within' as const,
    percentage: 62.5,
    categorySpending: [
      { category: 'Food & Dining', total: 450, percentage: 36 },
      { category: 'Transportation', total: 200, percentage: 16 },
      { category: 'Entertainment', total: 180, percentage: 14.4 },
      { category: 'Shopping', total: 150, percentage: 12 },
      { category: 'Bills', total: 120, percentage: 9.6 },
      { category: 'Other', total: 150.75, percentage: 12 },
    ],
    recentExpenses: [
      { id: 1, title: 'Grocery Shopping', amount: 85.50, date: '2024-01-15', category: 'Food' },
      { id: 2, title: 'Gas', amount: 45.00, date: '2024-01-14', category: 'Transportation' },
      { id: 3, title: 'Netflix Subscription', amount: 15.99, date: '2024-01-13', category: 'Entertainment' },
      { id: 4, title: 'Electric Bill', amount: 120.00, date: '2024-01-12', category: 'Bills' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within': return 'success';
      case 'approaching': return 'warning';
      case 'over': return 'error';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'within': return 'Within Budget';
      case 'approaching': return 'Approaching Limit';
      case 'over': return 'Over Budget';
      default: return 'No Budget Set';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome back! Here's your spending overview for this month.
      </Typography>

      <Grid container spacing={3}>
        {/* Budget Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Budget Status</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Monthly Budget: ${dashboardData.budget.toFixed(2)}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${dashboardData.totalSpent.toFixed(2)} / ${dashboardData.budget.toFixed(2)}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.percentage}
                    color={getStatusColor(dashboardData.status)}
                    sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2">
                    {dashboardData.percentage.toFixed(1)}%
                  </Typography>
                </Box>
                
                <Typography
                  variant="body1"
                  color={`${getStatusColor(dashboardData.status)}.main`}
                  fontWeight="bold"
                >
                  {getStatusText(dashboardData.status)}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Spent
                    </Typography>
                    <Typography variant="h6" color="error">
                      ${dashboardData.totalSpent.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Remaining
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ${dashboardData.remainingBudget.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Category sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Spending by Category</Typography>
              </Box>
              
              <List>
                {dashboardData.categorySpending.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.category}
                        secondary={`$${item.total.toFixed(2)} (${item.percentage.toFixed(1)}%)`}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Expenses
              </Typography>
              
              <List>
                {dashboardData.recentExpenses.map((expense) => (
                  <React.Fragment key={expense.id}>
                    <ListItem>
                      <ListItemText
                        primary={expense.title}
                        secondary={`${expense.category} • ${expense.date}`}
                      />
                      <Typography variant="h6" color="error">
                        ${expense.amount.toFixed(2)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
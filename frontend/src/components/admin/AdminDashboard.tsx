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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, Save } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import type { AdminInsights, Category, CategoryFormData } from '../../types/category.types';

interface ApiErrorResponse {
  error?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error || fallback;
  }
  return fallback;
};

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [categoryResponse, insightsResponse] = await Promise.all([
        categoryService.getCategories(),
        adminService.getInsights(),
      ]);
      setCategories(categoryResponse.data);
      setInsights(insightsResponse.data);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingId(null);
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSavingCategory(true);
      setError('');
      if (editingId) {
        await categoryService.updateCategory(editingId, {
          name: categoryForm.name.trim(),
          description: categoryForm.description?.trim(),
        });
      } else {
        await categoryService.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description?.trim(),
        });
      }
      resetCategoryForm();
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, 'Failed to save category'));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCategoryDelete = async (category: Category) => {
    if (!window.confirm(`Delete ${category.name}? Its expenses will move to Uncategorized.`)) {
      return;
    }

    try {
      setError('');
      await categoryService.deleteCategory(category.id);
      if (editingId === category.id) resetCategoryForm();
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (deleteError: unknown) {
      setError(getErrorMessage(deleteError, 'Failed to delete category'));
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingId(category.id);
    setCategoryForm({ name: category.name, description: category.description || '' });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Platform insights and category management.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {insights && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            ['Users', insights.totalUsers],
            ['Total expenses', insights.totalExpenses],
            ['Expense value', formatCurrency(insights.totalExpenseValue)],
            ['This month', insights.currentMonthExpenses],
          ].map(([label, value]) => (
            <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Management</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField label="Name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} />
                <TextField label="Description" value={categoryForm.description || ''} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={editingId ? <Save /> : <Add />} onClick={() => void handleCategorySubmit()} disabled={savingCategory}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId && <Button onClick={resetCategoryForm}>Cancel</Button>}
                </Box>
              </Box>
              <List>
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem secondaryAction={<Box><Button size="small" startIcon={<Edit />} onClick={() => handleCategoryEdit(category)}>Edit</Button><Button size="small" color="error" startIcon={<Delete />} onClick={() => void handleCategoryDelete(category)} disabled={category.name.toLowerCase() === 'uncategorized'}>Delete</Button></Box>}>
                      <ListItemText primary={category.name} secondary={category.description || 'No description'} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Spending by Category</Typography>
              {!insights || insights.categorySpending.length === 0 ? <Typography color="text.secondary">No platform expenses yet.</Typography> : insights.categorySpending.map((item) => {
                const maximum = insights.categorySpending[0]?.total || 1;
                return <Box key={item.category} sx={{ mb: 2 }}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>{item.category}</Typography><Typography>{formatCurrency(item.total)} ({item.count})</Typography></Box><LinearProgress variant="determinate" value={(item.total / maximum) * 100} /></Box>;
              })}
            </CardContent>
          </Card>
        </Grid>

        {insights && <>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card><CardContent><Typography variant="h6" gutterBottom>Most Used Categories</Typography><List>{insights.topCategories.map((item) => <ListItem key={item.category}><ListItemText primary={item.category} secondary={`${item.count} expenses`} /></ListItem>)}</List></CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card><CardContent><Typography variant="h6" gutterBottom>Least Used Categories</Typography><List>{insights.bottomCategories.map((item) => <ListItem key={item.category}><ListItemText primary={item.category} secondary={`${item.count} expenses`} /></ListItem>)}</List></CardContent></Card>
          </Grid>
          <Grid size={12}>
            <Card><CardContent><Typography variant="h6" gutterBottom>Recent Expenses</Typography><TableContainer sx={{ overflowX: 'auto' }}><Table><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Date</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead><TableBody>{insights.recentExpenses.map((expense) => <TableRow key={expense.id}><TableCell>{expense.title}</TableCell><TableCell>{expense.category}</TableCell><TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell><TableCell align="right">{formatCurrency(expense.amount)}</TableCell></TableRow>)}</TableBody></Table></TableContainer></CardContent></Card>
          </Grid>
          <Grid size={12}>
            <Card><CardContent><Typography variant="h6" gutterBottom>Recent Users</Typography><TableContainer sx={{ overflowX: 'auto' }}><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Joined</TableCell></TableRow></TableHead><TableBody>{insights.recentUsers.map((user) => <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell><TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell></TableRow>)}</TableBody></Table></TableContainer></CardContent></Card>
          </Grid>
        </>}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

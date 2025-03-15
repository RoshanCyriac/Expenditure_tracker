import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SavingsIcon from '@mui/icons-material/Savings';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function BudgetManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [budgets, setBudgets] = useState({});
  const [sections, setSections] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [totalBudget, setTotalBudget] = useState('');
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [categoryBudgetPeriod, setCategoryBudgetPeriod] = useState('monthly');
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [categoryError, setCategoryError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryAmount, setCategoryAmount] = useState('');
  const [monthlyTransactions, setMonthlyTransactions] = useState(null);
  const [sectionUtilization, setSectionUtilization] = useState({});
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [yearlyBudget, setYearlyBudget] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [virtualSavings, setVirtualSavings] = useState(null);

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const getDaysInYear = () => {
    const now = new Date();
    return ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 > 0) || now.getFullYear() % 400 == 0) ? 366 : 365;
  };

  // Get effective daily budget based on the selected period
  const getEffectiveDailyBudget = () => {
    if (dailyBudget) return parseFloat(dailyBudget) || 0;
    if (monthlyBudget) return (parseFloat(monthlyBudget) || 0) / getDaysInMonth();
    if (yearlyBudget) return (parseFloat(yearlyBudget) || 0) / getDaysInYear();
    return 0;
  };

  // Get effective monthly budget based on the selected period
  const getEffectiveMonthlyBudget = () => {
    if (monthlyBudget) return parseFloat(monthlyBudget) || 0;
    if (dailyBudget) return (parseFloat(dailyBudget) || 0) * getDaysInMonth();
    if (yearlyBudget) return (parseFloat(yearlyBudget) || 0) / 12;
    return 0;
  };

  // Get effective yearly budget based on the selected period
  const getEffectiveYearlyBudget = () => {
    if (yearlyBudget) return parseFloat(yearlyBudget) || 0;
    if (monthlyBudget) return (parseFloat(monthlyBudget) || 0) * 12;
    if (dailyBudget) return (parseFloat(dailyBudget) || 0) * getDaysInYear();
    return 0;
  };

  // Get effective category budget based on the period
  const getEffectiveCategoryBudget = (amount) => {
    if (!amount) return 0;
    const value = parseFloat(amount) || 0;
    
    switch (categoryBudgetPeriod) {
      case 'daily':
        return value * getDaysInMonth(); // Convert to monthly
      case 'yearly':
        return value / 12; // Convert to monthly
      default: // monthly
        return value;
    }
  };

  const validateAndUpdateBudgets = (type, value) => {
    const daysInMonth = getDaysInMonth();
    const daysInYear = getDaysInYear();
    
    let newDailyBudget = dailyBudget;
    let newMonthlyBudget = monthlyBudget;
    let newYearlyBudget = yearlyBudget;
    let error = '';

    switch(type) {
      case 'daily':
        newDailyBudget = value;
        const calculatedMonthly = parseFloat(value || 0) * daysInMonth;
        const calculatedYearly = parseFloat(value || 0) * daysInYear;

        if (monthlyBudget && calculatedMonthly > parseFloat(monthlyBudget)) {
          error = 'Daily budget exceeds monthly budget limit';
        } else if (yearlyBudget && calculatedYearly > parseFloat(yearlyBudget)) {
          error = 'Daily budget exceeds yearly budget limit';
        } else {
          // If no other budgets set, calculate them
          if (!monthlyBudget) newMonthlyBudget = calculatedMonthly.toString();
          if (!yearlyBudget) newYearlyBudget = calculatedYearly.toString();
        }
        break;

      case 'monthly':
        newMonthlyBudget = value;
        const dailyFromMonthly = parseFloat(value || 0) / daysInMonth;
        const yearlyFromMonthly = parseFloat(value || 0) * 12;

        if (yearlyBudget && yearlyFromMonthly > parseFloat(yearlyBudget)) {
          error = 'Monthly budget exceeds yearly budget limit';
        } else {
          // If no other budgets set, calculate them
          if (!dailyBudget) newDailyBudget = dailyFromMonthly.toString();
          if (!yearlyBudget) newYearlyBudget = yearlyFromMonthly.toString();
        }
        break;

      case 'yearly':
        newYearlyBudget = value;
        const monthlyFromYearly = parseFloat(value || 0) / 12;
        const dailyFromYearly = parseFloat(value || 0) / daysInYear;

        // Always calculate lower budgets from yearly
        newMonthlyBudget = monthlyFromYearly.toString();
        newDailyBudget = dailyFromYearly.toString();
        break;
    }

    setBudgetError(error);
    if (!error) {
      setDailyBudget(newDailyBudget);
      setMonthlyBudget(newMonthlyBudget);
      setYearlyBudget(newYearlyBudget);
      
      // Update total budget and utilization based on monthly value
      setTotalBudget(newMonthlyBudget);
      if (monthlyTransactions?.totalSpent) {
        setBudgetUtilization((monthlyTransactions.totalSpent / parseFloat(newMonthlyBudget)) * 100);
      }
    }
    return !error;
  };

  const handleBudgetChange = (section, value) => {
    const newBudgets = { ...budgets, [section]: value };
    setBudgets(newBudgets);
    
    // Update total
    const total = Object.values(newBudgets).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    setMonthlyTotal(total);

    // Update budget utilization
    if (totalBudget) {
      const effectiveBudget = getEffectiveMonthlyBudget();
      setBudgetUtilization((total / effectiveBudget) * 100);
    }
  };

  const handleTotalBudgetChange = (value) => {
    setTotalBudget(value);
    if (value) {
      const effectiveBudget = getEffectiveMonthlyBudget();
      setBudgetUtilization((monthlyTotal / effectiveBudget) * 100);
    } else {
      setBudgetUtilization(0);
    }
  };

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setBudgetPeriod(newPeriod);
      if (totalBudget) {
        const effectiveBudget = getEffectiveMonthlyBudget();
        setBudgetUtilization((monthlyTotal / effectiveBudget) * 100);
      }
    }
  };

  const handleCategoryPeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setCategoryBudgetPeriod(newPeriod);
      // Convert existing budgets to new period
      const convertedBudgets = {};
      Object.entries(categoryBudgets).forEach(([category, amount]) => {
        if (categoryBudgetPeriod === 'yearly' && newPeriod === 'monthly') {
          convertedBudgets[category] = (parseFloat(amount) / 12).toString();
        } else if (categoryBudgetPeriod === 'monthly' && newPeriod === 'yearly') {
          convertedBudgets[category] = (parseFloat(amount) * 12).toString();
        } else if (categoryBudgetPeriod === 'daily' && newPeriod === 'monthly') {
          convertedBudgets[category] = (parseFloat(amount) * getDaysInMonth()).toString();
        } else if (categoryBudgetPeriod === 'monthly' && newPeriod === 'daily') {
          convertedBudgets[category] = (parseFloat(amount) / getDaysInMonth()).toString();
        } else if (categoryBudgetPeriod === 'daily' && newPeriod === 'yearly') {
          convertedBudgets[category] = (parseFloat(amount) * 365).toString();
        } else if (categoryBudgetPeriod === 'yearly' && newPeriod === 'daily') {
          convertedBudgets[category] = (parseFloat(amount) / 365).toString();
        }
      });
      setCategoryBudgets(convertedBudgets);
    }
  };

  const handleCategorySelect = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setCategoryAmount(categoryBudgets[category] || '');
  };

  const handleCategoryAmountChange = (event) => {
    const amount = event.target.value;
    setCategoryAmount(amount);
    if (selectedCategory) {
      handleCategoryBudgetChange(selectedCategory, amount);
    }
  };

  const handleCategoryBudgetChange = (category, value) => {
    const newBudgets = { ...categoryBudgets, [category]: value };
    
    // Calculate total monthly equivalent for validation
    const totalMonthly = Object.entries(newBudgets).reduce((sum, [_, amount]) => {
      return sum + getEffectiveCategoryBudget(amount);
    }, 0);

    // Check if total exceeds monthly budget
    if (totalMonthly > getEffectiveMonthlyBudget()) {
      setCategoryError(`Total category budgets exceed the ${budgetPeriod} budget limit`);
    } else {
      setCategoryError('');
    }

    setCategoryBudgets(newBudgets);
  };

  const handleDeleteCategoryBudget = (category) => {
    const newBudgets = { ...categoryBudgets };
    delete newBudgets[category];
    setCategoryBudgets(newBudgets);
    if (selectedCategory === category) {
      setSelectedCategory('');
      setCategoryAmount('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch sections
        const sectionsResponse = await axios.get('http://localhost:5000/api/sections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Sections response:', sectionsResponse.data);
        setSections(sectionsResponse.data);

        // Fetch existing budgets
        const budgetsResponse = await axios.get('http://localhost:5000/api/budgets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Budgets response:', budgetsResponse.data);
        
        const budgetData = {};
        const categoryBudgetData = {};
        budgetsResponse.data.forEach(budget => {
          if (budget.section === 'total') {
            switch(budget.period) {
              case 'daily':
                validateAndUpdateBudgets('daily', budget.amount.toString());
                break;
              case 'monthly':
                validateAndUpdateBudgets('monthly', budget.amount.toString());
                break;
              case 'yearly':
                validateAndUpdateBudgets('yearly', budget.amount.toString());
                break;
            }
          } else {
            budgetData[budget.section] = budget.amount;
            categoryBudgetData[budget.section] = budget.amount;
          }
        });
        setBudgets(budgetData);
        setCategoryBudgets(categoryBudgetData);

        // Fetch current month's transactions
        const transactionsResponse = await axios.get('http://localhost:5000/api/transactions/current-month', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Transactions response:', transactionsResponse.data);
        setMonthlyTransactions(transactionsResponse.data);
        
        // Set utilization data from API response
        const { totalBudget: totalBudgetData, sectionUtilization: sectionUtil } = transactionsResponse.data;
        
        // Set total budget utilization
        setBudgetUtilization(totalBudgetData.utilization || 0);
        
        // Set section utilization
        const utilData = {};
        Object.entries(sectionUtil).forEach(([section, data]) => {
          utilData[section] = data.utilization;
        });
        setSectionUtilization(utilData);

        // After fetching transactions, calculate and save virtual savings
        if (monthlyTransactions && dailyBudget) {
          const today = new Date().toISOString().split('T')[0];
          const dailySpent = monthlyTransactions.totalSpent / getDaysInMonth();
          const dailyBudgetAmount = getEffectiveDailyBudget();
          const savedAmount = Math.max(0, dailyBudgetAmount - dailySpent);

          if (savedAmount > 0) {
            await axios.post('http://localhost:5000/api/virtual-savings', {
              date: today,
              amount: savedAmount,
              dailyBudget: dailyBudgetAmount,
              actualSpent: dailySpent
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load budgets. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [monthlyTransactions, dailyBudget]);

  useEffect(() => {
    const fetchVirtualSavings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/virtual-savings/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVirtualSavings(response.data);
      } catch (error) {
        console.error('Error fetching virtual savings:', error);
      }
    };

    fetchVirtualSavings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const budgetData = [
        // Add budgets for all periods
        { 
          section: 'total', 
          amount: parseFloat(dailyBudget) || 0,
          period: 'daily'
        },
        { 
          section: 'total', 
          amount: parseFloat(monthlyBudget) || 0,
          period: 'monthly'
        },
        { 
          section: 'total', 
          amount: parseFloat(yearlyBudget) || 0,
          period: 'yearly'
        },
        // Add category budgets
        ...Object.entries(categoryBudgets).map(([section, amount]) => ({
          section,
          amount: parseFloat(amount) || 0,
          period: categoryBudgetPeriod
        }))
      ];

      await axios.post('http://localhost:5000/api/budgets', budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Budgets saved successfully!');
      setIsEditingBudget(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving budgets:', error);
      setError('Failed to save budgets. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getBudgetUtilizationColor = (percentage) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#22c55e';
  };

  const renderCategoryBudgetList = () => (
    <Grid container spacing={2}>
      {sections.map((section) => (
        <Grid item xs={12} key={section.id || section._id}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {section.name || section}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                  ₹{categoryBudgets[section.name || section] || '0.00'}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDeleteCategoryBudget(section.name || section)}
                  sx={{
                    color: '#ef4444',
                    borderColor: '#ef4444',
                    minWidth: 0,
                    p: 0.5,
                    '&:hover': {
                      borderColor: '#dc2626',
                      bgcolor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              </Box>
            </Box>

            {/* Add utilization bar */}
            {categoryBudgets[section.name || section] && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Utilization
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getBudgetUtilizationColor(sectionUtilization[section.name || section] || 0),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {sectionUtilization[section.name || section] > 90 && <WarningIcon fontSize="small" />}
                    {(sectionUtilization[section.name || section] || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(sectionUtilization[section.name || section] || 0, 100)}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getBudgetUtilizationColor(sectionUtilization[section.name || section] || 0),
                      borderRadius: 2
                    }
                  }}
                />
              </>
            )}

            {/* Add spent amount */}
            {monthlyTransactions && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: 1
                }}
              >
                Spent this month: ₹{(monthlyTransactions.sectionTotals[section.name || section] || 0).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  const renderBudgetInputs = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {budgetError && (
        <Alert 
          severity="error" 
          sx={{ 
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            color: 'white',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-icon': {
              color: '#ef4444'
            }
          }}
        >
          {budgetError}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Daily Budget"
          type="number"
          value={dailyBudget}
          onChange={(e) => validateAndUpdateBudgets('daily', e.target.value)}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)' }}>₹</Typography>
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8b5cf6'
              }
            }
          }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            if (dailyBudget) {
              const daily = parseFloat(dailyBudget);
              const monthly = daily * getDaysInMonth();
              const yearly = daily * getDaysInYear();
              setMonthlyBudget(monthly.toString());
              setYearlyBudget(yearly.toString());
              setTotalBudget(monthly.toString());
              if (monthlyTransactions?.totalSpent) {
                setBudgetUtilization((monthlyTransactions.totalSpent / monthly) * 100);
              }
            }
          }}
          sx={{
            height: '56px',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.5)',
            '&:hover': {
              borderColor: '#8b5cf6',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Set All
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Monthly Budget"
          type="number"
          value={monthlyBudget}
          onChange={(e) => validateAndUpdateBudgets('monthly', e.target.value)}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)' }}>₹</Typography>
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8b5cf6'
              }
            }
          }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            if (monthlyBudget) {
              const monthly = parseFloat(monthlyBudget);
              const daily = monthly / getDaysInMonth();
              const yearly = monthly * 12;
              setDailyBudget(daily.toString());
              setYearlyBudget(yearly.toString());
              setTotalBudget(monthly.toString());
              if (monthlyTransactions?.totalSpent) {
                setBudgetUtilization((monthlyTransactions.totalSpent / monthly) * 100);
              }
            }
          }}
          sx={{
            height: '56px',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.5)',
            '&:hover': {
              borderColor: '#8b5cf6',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Set All
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Yearly Budget"
          type="number"
          value={yearlyBudget}
          onChange={(e) => validateAndUpdateBudgets('yearly', e.target.value)}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)' }}>₹</Typography>
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8b5cf6'
              }
            }
          }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            if (yearlyBudget) {
              const yearly = parseFloat(yearlyBudget);
              const monthly = yearly / 12;
              const daily = yearly / getDaysInYear();
              setDailyBudget(daily.toString());
              setMonthlyBudget(monthly.toString());
              setTotalBudget(monthly.toString());
              if (monthlyTransactions?.totalSpent) {
                setBudgetUtilization((monthlyTransactions.totalSpent / monthly) * 100);
              }
            }
          }}
          sx={{
            height: '56px',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.5)',
            '&:hover': {
              borderColor: '#8b5cf6',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Set All
        </Button>
      </Box>
    </Box>
  );

  const renderBudgetSummaryView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#8b5cf6', fontWeight: 600, fontSize: '1.1rem' }}>
          Budget Overview
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setIsEditingBudget(true)}
          startIcon={<EditIcon />}
          sx={{
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.5)',
            '&:hover': {
              borderColor: '#8b5cf6',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Edit Budgets
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Daily Budget Card */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 92, 246, 0.2)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TodayIcon sx={{ color: '#8b5cf6' }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Daily Budget
              </Typography>
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1.5rem' }}>
              ₹{getEffectiveDailyBudget().toFixed(2)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                Daily Utilization
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((budgetUtilization / getDaysInMonth()), 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getBudgetUtilizationColor(budgetUtilization / getDaysInMonth()),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            {/* Add Virtual Savings Section */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Today's Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <SavingsIcon fontSize="small" />
                  ₹{monthlyTransactions ? Math.max(0, getEffectiveDailyBudget() - (monthlyTransactions.totalSpent / getDaysInMonth())).toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Virtual Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600
                  }}
                >
                  ₹{virtualSavings ? virtualSavings.totalSavings.toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/savings-target')}
                  sx={{
                    color: '#22c55e',
                    borderColor: 'rgba(34, 197, 94, 0.5)',
                    '&:hover': {
                      borderColor: '#22c55e',
                      bgcolor: 'rgba(34, 197, 94, 0.1)'
                    }
                  }}
                >
                  View Savings in Dashboard
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Monthly Budget Card */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 92, 246, 0.2)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: '#8b5cf6' }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Monthly Budget
              </Typography>
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1.5rem' }}>
              ₹{getEffectiveMonthlyBudget().toFixed(2)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                Monthly Utilization
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(budgetUtilization, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getBudgetUtilizationColor(budgetUtilization),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            {/* Add Monthly Savings Section */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Month's Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <SavingsIcon fontSize="small" />
                  ₹{monthlyTransactions ? Math.max(0, getEffectiveMonthlyBudget() - monthlyTransactions.totalSpent).toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Average Daily Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600
                  }}
                >
                  ₹{virtualSavings ? (virtualSavings.dailyAverage || 0).toFixed(2) : '0.00'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Yearly Budget Card */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 92, 246, 0.2)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarMonthIcon sx={{ color: '#8b5cf6' }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Yearly Budget
              </Typography>
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1.5rem' }}>
              ₹{getEffectiveYearlyBudget().toFixed(2)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                Yearly Utilization
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((budgetUtilization * 12), 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getBudgetUtilizationColor(budgetUtilization * 12),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            {/* Add Yearly Savings Section */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Projected Yearly Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <SavingsIcon fontSize="small" />
                  ₹{monthlyTransactions ? (Math.max(0, getEffectiveMonthlyBudget() - monthlyTransactions.totalSpent) * 12).toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Year-to-Date Savings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#22c55e',
                    fontWeight: 600
                  }}
                >
                  ₹{virtualSavings ? (virtualSavings.totalSavings * (12 / new Date().getMonth() + 1)).toFixed(2) : '0.00'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Additional Budget Statistics */}
      <Box sx={{ 
        mt: 3,
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Daily Spent:
              </Typography>
              <Typography sx={{ color: 'white', fontWeight: 600 }}>
                ₹{monthlyTransactions ? (monthlyTransactions.totalSpent / getDaysInMonth()).toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Monthly Spent:
              </Typography>
              <Typography sx={{ color: 'white', fontWeight: 600 }}>
                ₹{monthlyTransactions ? monthlyTransactions.totalSpent.toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Projected Yearly:
              </Typography>
              <Typography sx={{ color: 'white', fontWeight: 600 }}>
                ₹{monthlyTransactions ? (monthlyTransactions.totalSpent * 12).toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1e1e1e' }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          py: 2,
          px: { xs: 2, sm: 4, md: 8, lg: 20 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#8b5cf6',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}
          >
            Budget Management
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box 
        sx={{ 
          px: { xs: 2, sm: 4, md: 8, lg: 20 },
          py: 4
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : (
          <>
            {/* Total Budget Card */}
            <Paper
              sx={{
                bgcolor: '#262626',
                borderRadius: 3,
                p: 3,
                mb: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {isEditingBudget ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {renderBudgetInputs()}
                </Box>
              ) : (
                renderBudgetSummaryView()
              )}
            </Paper>

            {/* Category Budgets */}
            <Paper
              sx={{
                bgcolor: '#262626',
                borderRadius: 3,
                p: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  Category Budgets
                </Typography>

                <ToggleButtonGroup
                  value={categoryBudgetPeriod}
                  exclusive
                  onChange={handleCategoryPeriodChange}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiToggleButton-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      '&.Mui-selected': {
                        color: '#8b5cf6',
                        bgcolor: 'rgba(139, 92, 246, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(139, 92, 246, 0.15)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="daily" sx={{ px: 2, py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TodayIcon fontSize="small" />
                      Daily
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="monthly" sx={{ px: 2, py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" />
                      Monthly
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="yearly" sx={{ px: 2, py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" />
                      Yearly
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {categoryError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#ef4444'
                    }
                  }}
                >
                  {categoryError}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 3,
                  p: 3,
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 2,
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Total Category Budget ({categoryBudgetPeriod}):
                    </Typography>
                    <Typography sx={{ 
                      color: categoryError ? '#ef4444' : '#22c55e',
                      fontWeight: 600 
                    }}>
                      ₹{Object.values(categoryBudgets).reduce((sum, amount) => 
                        sum + (parseFloat(amount) || 0), 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl 
                      fullWidth 
                      sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8b5cf6',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#8b5cf6'
                          }
                        }
                      }}
                    >
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="Category"
                        onChange={handleCategorySelect}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#2f2f2f',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              '& .MuiMenuItem-root': {
                                color: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  bgcolor: 'rgba(139, 92, 246, 0.1)'
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                                  '&:hover': {
                                    bgcolor: 'rgba(139, 92, 246, 0.3)'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontStyle: 'italic'
                        }}>
                          <em>Select a category</em>
                        </MenuItem>
                        {sections.map((section) => (
                          <MenuItem 
                            key={section.id || section._id} 
                            value={section.name || section}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 2
                            }}
                          >
                            <span>{section.name || section}</span>
                            <Typography sx={{ 
                              color: '#8b5cf6',
                              fontWeight: 600
                            }}>
                              ₹{categoryBudgets[section.name || section] || '0.00'}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label={`Budget Amount (${categoryBudgetPeriod})`}
                      type="number"
                      value={categoryAmount}
                      onChange={handleCategoryAmountChange}
                      disabled={!selectedCategory}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)' }}>₹</Typography>
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8b5cf6',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#8b5cf6'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Category Budget List */}
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Category Budget Allocation
                </Typography>
                {renderCategoryBudgetList()}
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || !!categoryError}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#7c3aed',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(139, 92, 246, 0.5)',
                    }
                  }}
                >
                  {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Budgets'}
                </Button>
              </Box>
            </Paper>
          </>
        )}

        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ 
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar 
          open={!!success} 
          autoHideDuration={3000} 
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            onClose={() => setSuccess('')}
            sx={{ 
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              color: 'white',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              '& .MuiAlert-icon': {
                color: '#22c55e'
              }
            }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default BudgetManagement; 
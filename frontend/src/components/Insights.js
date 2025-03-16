import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';

function Insights() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Generate list of months between two dates
  const getMonthsBetweenDates = (startDate, endDate) => {
    const months = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Set both dates to first of month for comparison
    currentDate.setDate(1);
    lastDate.setDate(1);
    
    // Add one month to lastDate to include current month
    lastDate.setMonth(lastDate.getMonth() + 1);

    // Add months until we reach end date
    while (currentDate < lastDate) {
      months.push(currentDate.toISOString().slice(0, 7));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Log months for debugging
    console.log('Available months:', months.map(m => new Date(m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })));

    return months.reverse(); // Most recent first
  };

  // Fetch account creation date and set available months
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/account-info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const creationDate = new Date(response.data.createdAt);
        const today = new Date();
        const months = getMonthsBetweenDates(creationDate, today);
        setAvailableMonths(months);
        
        // If no month is selected, select the current month
        if (!selectedMonth) {
          setSelectedMonth(today.toISOString().slice(0, 7));
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
      }
    };

    fetchAccountData();
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!selectedMonth) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [expensesRes, savingsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/expenses/monthly/${selectedMonth}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/virtual-savings/monthly/${selectedMonth}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setInsights({
          expenses: expensesRes.data,
          savings: savingsRes.data
        });
      } catch (error) {
        console.error('Error fetching insights:', error);
      }
      setLoading(false);
    };

    fetchInsights();
  }, [selectedMonth]);

  const renderMetricCard = (title, value, icon, color, subtitle) => (
    <Paper
      sx={{
        bgcolor: '#262626',
        p: 3,
        borderRadius: 3,
        height: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: color, fontWeight: 600 }}>
        ₹{value.toFixed(2)}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Monthly Insights
        </Typography>
      </Box>

      {/* Month Selector */}
      <FormControl
        sx={{
          mb: 4,
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
          }
        }}
      >
        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Select Month"
          onChange={(e) => setSelectedMonth(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#2f2f2f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '& .MuiMenuItem-root': {
                  color: 'white'
                }
              }
            }
          }}
        >
          {availableMonths.map((month) => (
            <MenuItem key={month} value={month}>
              {new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : insights ? (
        <Grid container spacing={3}>
          {/* Total Spending */}
          <Grid item xs={12} md={6} lg={3}>
            {renderMetricCard(
              'Total Spending',
              insights.expenses.total,
              <AccountBalanceWalletIcon sx={{ color: '#ef4444' }} />,
              '#ef4444',
              'All expenses this month'
            )}
          </Grid>

          {/* Total Savings */}
          <Grid item xs={12} md={6} lg={3}>
            {renderMetricCard(
              'Total Savings',
              insights.savings.total,
              <SavingsIcon sx={{ color: '#22c55e' }} />,
              '#22c55e',
              'Amount saved this month'
            )}
          </Grid>

          {/* Daily Average Spending */}
          <Grid item xs={12} md={6} lg={3}>
            {renderMetricCard(
              'Daily Average',
              insights.expenses.dailyAverage,
              <ShowChartIcon sx={{ color: '#8b5cf6' }} />,
              '#8b5cf6',
              'Average daily expenses'
            )}
          </Grid>

          {/* Spending Trend */}
          <Grid item xs={12} md={6} lg={3}>
            {renderMetricCard(
              'Monthly Trend',
              insights.expenses.trend,
              <TrendingUpIcon sx={{ color: '#f59e0b' }} />,
              '#f59e0b',
              `${insights.expenses.trend >= 0 ? '↑' : '↓'} vs last month`
            )}
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12}>
            <Paper
              sx={{
                bgcolor: '#262626',
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                Category Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {insights.expenses.categories.map((category) => (
                  <Box key={category.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {category.name}
                      </Typography>
                      <Typography sx={{ color: '#22c55e' }}>
                        ₹{category.total.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: '4px',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(category.total / insights.expenses.total) * 100}%`,
                          height: '100%',
                          bgcolor: '#8b5cf6',
                          borderRadius: '2px'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
          No data available for the selected month
        </Typography>
      )}
    </Box>
  );
}

export default Insights; 
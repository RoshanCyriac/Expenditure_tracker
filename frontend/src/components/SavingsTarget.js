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
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SavingsTarget() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetPeriod, setTargetPeriod] = useState('monthly');
  const [targetAmount, setTargetAmount] = useState('');
  const [virtualSavings, setVirtualSavings] = useState(null);
  const [monthlyTransactions, setMonthlyTransactions] = useState(null);
  const [savingsInsights, setSavingsInsights] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savedTarget, setSavedTarget] = useState(null);

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const calculateSavingsInsights = (target) => {
    if (!monthlyTransactions || !target) return null;

    const currentMonthlySpending = monthlyTransactions.totalSpent;
    const daysInMonth = getDaysInMonth();
    const currentDailySpending = currentMonthlySpending / daysInMonth;

    // Convert target to monthly if it's not
    let monthlyTarget = target;
    if (targetPeriod === 'daily') {
      monthlyTarget = target * daysInMonth;
    } else if (targetPeriod === 'yearly') {
      monthlyTarget = target / 12;
    }

    const currentMonthlySavings = virtualSavings?.totalSavings || 0;
    const savingsGap = monthlyTarget - currentMonthlySavings;
    const dailyReductionNeeded = savingsGap / daysInMonth;
    
    const projectedAnnualSavings = currentMonthlySavings * 12;
    const timeToTarget = savingsGap > 0 ? (savingsGap / (currentMonthlySavings || 1)).toFixed(1) : 0;
    
    const progress = (currentMonthlySavings / monthlyTarget) * 100;

    return {
      currentMonthlySpending,
      currentDailySpending,
      monthlyTarget,
      savingsGap,
      dailyReductionNeeded,
      projectedAnnualSavings,
      timeToTarget,
      progress: Math.min(progress, 100)
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch saved target
        const targetResponse = await axios.get('http://localhost:5000/api/savings-target', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (targetResponse.data) {
          setSavedTarget(targetResponse.data);
          setTargetAmount(targetResponse.data.amount.toString());
          setTargetPeriod(targetResponse.data.period);
          setIsEditMode(false);
        } else {
          setIsEditMode(true); // If no target exists, start in edit mode
        }

        // Fetch virtual savings data
        const savingsResponse = await axios.get('http://localhost:5000/api/virtual-savings/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVirtualSavings(savingsResponse.data);

        // Fetch current month's transactions
        const transactionsResponse = await axios.get('http://localhost:5000/api/transactions/current-month', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMonthlyTransactions(transactionsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load savings data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (targetAmount) {
      const insights = calculateSavingsInsights(parseFloat(targetAmount));
      setSavingsInsights(insights);
    }
  }, [targetAmount, targetPeriod, virtualSavings, monthlyTransactions]);

  const handleSaveTarget = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/savings-target', {
        amount: parseFloat(targetAmount),
        period: targetPeriod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedTarget({ amount: parseFloat(targetAmount), period: targetPeriod });
      setIsEditMode(false);
      // Show success message or update UI
    } catch (error) {
      setError('Failed to save target. Please try again.');
    }
  };

  const renderSavingsProgress = () => (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: '200px', height: '200px' }}>
      <CircularProgress
        variant="determinate"
        value={savingsInsights?.progress || 0}
        size={200}
        thickness={4}
        sx={{
          color: '#22c55e',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: '#22c55e', fontWeight: 600 }}>
          {savingsInsights?.progress.toFixed(0)}%
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          of target
        </Typography>
      </Box>
    </Box>
  );

  const renderTargetControls = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
      {!isEditMode ? (
        <Button
          variant="outlined"
          onClick={() => setIsEditMode(true)}
          sx={{
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.5)',
            '&:hover': {
              borderColor: '#8b5cf6',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Edit Target
        </Button>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              if (savedTarget) {
                setTargetAmount(savedTarget.amount.toString());
                setTargetPeriod(savedTarget.period);
              }
              setIsEditMode(false);
            }}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTarget}
            disabled={!targetAmount}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': {
                bgcolor: '#7c3aed'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(139, 92, 246, 0.5)'
              }
            }}
          >
            Save Target
          </Button>
        </>
      )}
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
            Savings Target
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
          <Grid container spacing={4}>
            {/* Target Setting Section */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  bgcolor: '#262626',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography sx={{ color: '#8b5cf6', fontWeight: 600, mb: 3 }}>
                  {isEditMode ? 'Set Your Savings Target' : 'Your Savings Target'}
                </Typography>

                {!isEditMode && savedTarget && (
                  <Box 
                    sx={{ 
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Current Target:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography sx={{ color: 'white', fontSize: '2rem', fontWeight: 600 }}>
                        ₹{parseFloat(savedTarget.amount).toFixed(2)}
                      </Typography>
                      <Typography 
                        sx={{ 
                          color: '#8b5cf6',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      >
                        per {savedTarget.period}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Target Amount"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    disabled={!isEditMode}
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

                  <ToggleButtonGroup
                    value={targetPeriod}
                    exclusive
                    onChange={(e, newPeriod) => newPeriod && setTargetPeriod(newPeriod)}
                    disabled={!isEditMode}
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

                {renderTargetControls()}
              </Paper>
            </Grid>

            {savingsInsights && (
              <>
                {/* Progress Overview */}
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      bgcolor: '#262626',
                      borderRadius: 3,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <Typography sx={{ color: '#8b5cf6', fontWeight: 600, alignSelf: 'flex-start' }}>
                      Progress to Target
                    </Typography>
                    
                    {renderSavingsProgress()}

                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                      <Typography sx={{ color: 'white', mb: 1 }}>
                        Current Monthly Savings: ₹{virtualSavings?.totalSavings.toFixed(2)}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Target: ₹{savingsInsights.monthlyTarget.toFixed(2)} / month
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Action Steps */}
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      bgcolor: '#262626',
                      borderRadius: 3,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: '100%'
                    }}
                  >
                    <Typography sx={{ color: '#8b5cf6', fontWeight: 600, mb: 3 }}>
                      Path to Your Goal
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Card sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SpeedIcon sx={{ color: '#22c55e' }} />
                            <Typography sx={{ color: '#22c55e', fontWeight: 600 }}>
                              Daily Action Plan
                            </Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Reduce daily spending by ₹{savingsInsights.dailyReductionNeeded > 0 ? 
                              savingsInsights.dailyReductionNeeded.toFixed(2) : '0.00'} to reach your target
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TrendingUpIcon sx={{ color: '#8b5cf6' }} />
                            <Typography sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                              Projected Timeline
                            </Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {savingsInsights.timeToTarget > 0 
                              ? `At current rate, you\'ll reach your target in ${savingsInsights.timeToTarget} months`
                              : 'Congratulations! You\'ve reached your target! 🎉'}
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TrendingDownIcon sx={{ color: '#f59e0b' }} />
                            <Typography sx={{ color: '#f59e0b', fontWeight: 600 }}>
                              Spending Insights
                            </Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                            Current daily spending: ₹{savingsInsights.currentDailySpending.toFixed(2)}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Target daily spending: ₹{(savingsInsights.currentDailySpending - savingsInsights.dailyReductionNeeded).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
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
      </Box>
    </Box>
  );
}

export default SavingsTarget; 
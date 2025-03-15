import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

function SectionTransactions() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filteredStats, setFilteredStats] = useState({ total: 0, average: 0 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/sections/${section}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Format the transactions data
        const formattedTransactions = response.data.transactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount),
          createdAt: new Date(t.createdAt)
        }));
        
        setTransactions(formattedTransactions);
        setFilteredTransactions(formattedTransactions);
        setStats({
          total: response.data.total,
          average: response.data.averagePerDay
        });
        setFilteredStats({
          total: response.data.total,
          average: response.data.averagePerDay
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [section]);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredTransactions(transactions);
      setFilteredStats(stats);
      return;
    }

    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999); // Include the entire end date

      return transactionDate >= start && transactionDate <= end;
    });

    // Calculate new stats for filtered transactions
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const uniqueDays = new Set(
      filtered.map(t => new Date(t.createdAt).toDateString())
    ).size;
    const average = uniqueDays > 0 ? total / uniqueDays : 0;

    setFilteredTransactions(filtered);
    setFilteredStats({
      total,
      average
    });
  }, [startDate, endDate, transactions, stats]);

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
            {section}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box 
        sx={{ 
          px: { xs: 2, sm: 4, md: 8, lg: 20 },
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        {/* Date Range Filters */}
        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
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
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)'
              }
            }}
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
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
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)'
              }
            }}
          />
          {(startDate || endDate) && (
            <Button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              sx={{
                color: '#8b5cf6',
                borderColor: '#8b5cf6',
                '&:hover': {
                  borderColor: '#7c3aed',
                  bgcolor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
              variant="outlined"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3
          }}
        >
          {/* Total Expenses Card */}
          <Box
            sx={{
              bgcolor: '#262626',
              borderRadius: 3,
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingUpIcon sx={{ color: '#8b5cf6' }} />
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Total Expenses
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} width={150} height={40} />
            ) : (
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                ₹{filteredStats.total.toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Average Per Day Card */}
          <Box
            sx={{
              bgcolor: '#262626',
              borderRadius: 3,
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CalendarTodayIcon sx={{ color: '#8b5cf6' }} />
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Average Per Day
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} width={150} height={40} />
            ) : (
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                ₹{filteredStats.average.toFixed(2)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Transactions Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: '#262626',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiTableCell-root': {
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Date & Time
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {new Date(transaction.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        color: '#22c55e',
                        fontWeight: 600
                      }}
                    >
                      ₹{transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      No transactions found in this {startDate || endDate ? 'date range' : 'section'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default SectionTransactions; 
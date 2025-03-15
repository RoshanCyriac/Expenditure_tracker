import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '' });
  const [newSection, setNewSection] = useState('');
  const [error, setError] = useState('');
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false);
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);
  const [sectionMenuAnchorEl, setSectionMenuAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [editedExpense, setEditedExpense] = useState({ amount: '', category: '' });

  // Fetch categories and recent expenses when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [categoriesRes, expensesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/recent-expenses', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setCategories(categoriesRes.data);
        setRecentExpenses(expensesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    navigate(`/transactions/${category}`);
    handleCategoryClose();
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleAddSection = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/add-section', 
        { sectionName: newSection },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Add the new section to the categories list
      setCategories(prev => [...prev, newSection]);
      
      // Clear the input and close the dialog
      setNewSection('');
      setSectionDialogOpen(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add section');
    }
  };

  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/add-expense',
        { amount: newExpense.amount, category: newExpense.category },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Add the new expense to the list
      setRecentExpenses(prev => [response.data.expense, ...prev]);
      
      // Clear the form and close the dialog
      setNewExpense({ amount: '', category: '' });
      setExpenseDialogOpen(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/expenses/${expenseToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the expense from the list
      setRecentExpenses(prev => prev.filter(expense => expense.id !== expenseToDelete.id));
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleSectionMenuOpen = (event, section) => {
    event.stopPropagation();
    setSectionMenuAnchorEl(event.currentTarget);
    setSelectedSection(section);
  };

  const handleSectionMenuClose = () => {
    setSectionMenuAnchorEl(null);
    setSelectedSection(null);
  };

  const handleDeleteSection = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/sections/${sectionToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the section from the categories list
      setCategories(prev => prev.filter(section => section !== sectionToDelete));
      
      // Update expenses that had this section to "None"
      setRecentExpenses(prev => prev.map(expense => 
        expense.section === sectionToDelete 
          ? { ...expense, section: '' }
          : expense
      ));
      
      setDeleteSectionDialogOpen(false);
      setSectionToDelete(null);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete section');
    }
  };

  const handleEditExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/expenses/${expenseToEdit.id}`,
        { 
          amount: editedExpense.amount,
          section: editedExpense.category
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update the expense in the list
      setRecentExpenses(prev => prev.map(expense => 
        expense.id === expenseToEdit.id ? response.data.expense : expense
      ));
      
      // Clear the form and close the dialog
      setEditedExpense({ amount: '', category: '' });
      setEditExpenseDialogOpen(false);
      setExpenseToEdit(null);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update expense');
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 8, lg: 20 } }}>
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 800,
              color: '#8b5cf6',
              letterSpacing: '-0.5px'
            }}
          >
            Budget Buddy
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={handleCategoryClick}
            sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                px: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
              '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
              Categories
          </Button>
            <Button 
              color="inherit"
                sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                px: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
                  '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
            >
              Profile
            </Button>
          <Button 
              variant="contained" 
              onClick={handleSignOut}
            sx={{ 
                ml: 2,
                bgcolor: '#8b5cf6',
              color: 'white',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
              '&:hover': {
                  bgcolor: '#7c3aed',
                },
                transition: 'all 0.2s ease'
            }}
          >
              Sign Out
          </Button>
          </Box>
          <Button
            onClick={() => navigate('/budget')}
            startIcon={<AccountBalanceWalletIcon />}
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
            Manage Budgets
          </Button>
        </Toolbar>
      </AppBar>

      <Box
            sx={{ 
          background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, sm: 4, md: 8, lg: 20 },
          pt: { xs: 4, md: 6 },
          pb: 4,
          gap: 4
        }}
      >
        {/* Welcome Section */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            mb: { xs: 4, md: 6 },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -40,
              left: -80,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 0
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#8b5cf6',
                  fontWeight: 600,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#8b5cf6',
                    animation: 'pulse 2s infinite'
                  }} 
                />
                Dashboard Overview
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '2.8rem' },
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                  mb: 2,
              color: 'white',
                  position: 'relative'
                }}
              >
                <Box component="span" sx={{
                  display: 'block',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    width: 4,
                    height: '60%',
                    bgcolor: '#8b5cf6',
                    transform: 'translateY(-50%)',
                    borderRadius: 4
                  }
                }}>
                  Ready to track expenses?
                </Box>
                <Box 
                  component="span" 
                  sx={{ 
                    color: '#8b5cf6',
                    position: 'relative',
                    display: 'block',
                    mt: 2,
                    pl: 3,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      width: 12,
                      height: 2,
                      bgcolor: '#8b5cf6',
                      transform: 'translateY(-50%)',
                      borderRadius: 4
                    },
                    animation: 'slideIn 0.6s ease-out',
                    '@keyframes slideIn': {
                      from: {
                        opacity: 0,
                        transform: 'translateX(-20px)'
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateX(0)'
                      }
                    }
                  }}
                >
                  {user?.username?.toUpperCase()}
                </Box>
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                py: 1,
                px: 2,
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <Box 
                  sx={{ 
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#22c55e'
                  }}
                />
                <Typography 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  Active Now
                </Typography>
              </Box>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem'
                }}
              >
                Last login: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1rem', md: '1.1rem' },
                maxWidth: '600px',
                lineHeight: 1.6,
                position: 'relative',
                pl: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 12,
                  width: 20,
                  height: 2,
                  bgcolor: '#8b5cf6',
                  borderRadius: 1
                }
              }}
            >
              Track your expenses, manage your budget, and achieve your financial goals with ease.
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1
          }}>
          <Button 
              variant="contained"
              size="large"
              onClick={() => setExpenseDialogOpen(true)}
            sx={{ 
                bgcolor: '#8b5cf6',
              color: 'white',
                fontSize: '0.95rem',
                py: 1.8,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s'
                },
              '&:hover': {
                  bgcolor: '#7c3aed',
                  transform: 'translateY(-2px)',
                  '&::before': {
                    transform: 'translateX(100%)'
              }
                },
                transition: 'all 0.3s ease'
            }}
          >
              Add Expense
          </Button>
          <Button 
            variant="outlined" 
              size="large"
              onClick={() => setSectionDialogOpen(true)}
            sx={{ 
              color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.95rem',
                py: 1.8,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Section
          </Button>
          </Box>
        </Box>

        {/* Recent Expenses Table */}
      <Box
        sx={{
            bgcolor: '#262626',
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            flex: 1,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
        <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '1.2rem', md: '1.4rem' }
              }}
            >
              Recent Expenses
        </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              py: 0.75,
              px: 2
            }}>
        <Typography 
          sx={{ 
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                {recentExpenses.length}
        </Typography>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.95rem'
                }}
              >
                {recentExpenses.length === 1 ? 'Transaction' : 'Transactions'}
              </Typography>
            </Box>
          </Box>

          {recentExpenses.length > 0 ? (
            <Box sx={{ 
              overflowX: 'auto',
              flex: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)'
                }
              }
            }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '12px 16px', 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Date & Time</th>
                    <th style={{ 
                      textAlign: 'right', 
                      padding: '12px 16px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Amount</th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '12px 16px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Section</th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '12px 16px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense, index) => (
                    <tr 
                      key={expense.id}
                      style={{
                        backgroundColor: '#2f2f2f',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#333333';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2f2f2f';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <td style={{ 
                        padding: '16px',
                        borderRadius: '8px 0 0 8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.95rem'
                      }}>
                        {new Date(expense.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '16px',
                        color: '#22c55e',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>
                        ₹{parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td style={{ 
                        padding: '16px',
                        color: expense.section ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.95rem'
                      }}>
                        {expense.section || 'None'}
                      </td>
                      <td style={{ 
                        padding: '16px',
                        textAlign: 'center',
                        borderRadius: '0 8px 8px 0'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            onClick={() => {
                              setExpenseToEdit(expense);
                              setEditedExpense({
                                amount: expense.amount,
                                category: expense.section || ''
                              });
                              setEditExpenseDialogOpen(true);
                            }}
            sx={{
                              color: '#8b5cf6',
                              p: 1,
              '&:hover': {
                                bgcolor: 'rgba(139, 92, 246, 0.1)',
                              }
                            }}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setExpenseToDelete(expense);
                              setDeleteDialogOpen(true);
                            }}
            sx={{ 
                              color: '#ef4444',
                              p: 1,
              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                p: 4,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 2,
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography 
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                No expenses recorded yet
              </Typography>
              <Typography 
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                  maxWidth: '400px',
                  fontSize: '0.95rem'
                }}
              >
                Click on "Add Expense" above to start tracking your expenses
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Update the dialogs with dark theme */}
      <Dialog 
        open={expenseDialogOpen} 
        onClose={() => {
          setExpenseDialogOpen(false);
          setNewExpense({ amount: '', category: '' });
          setError('');
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#262626',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2.5
          }}
        >
          Add New Expense
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
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
              }
            }}
          />
          <FormControl 
            fullWidth 
            sx={{ 
              mt: 2,
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
              value={newExpense.category}
              label="Category"
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
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
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem 
                  key={category} 
                  value={category}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setExpenseDialogOpen(false);
              setNewExpense({ amount: '', category: '' });
              setError('');
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#8b5cf6',
              color: 'white',
              px: 3,
              '&:hover': {
                bgcolor: '#7c3aed'
              }
            }}
            onClick={handleAddExpense}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Section Dialog with dark theme */}
      <Dialog 
        open={sectionDialogOpen} 
        onClose={() => setSectionDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#262626',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2.5
          }}
        >
          Add New Section
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Section Name"
            fullWidth
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
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
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setSectionDialogOpen(false);
              setError('');
              setNewSection('');
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              bgcolor: '#8b5cf6',
              color: 'white',
              px: 3,
              '&:hover': {
                bgcolor: '#7c3aed'
              }
            }}
            onClick={handleAddSection}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog with dark theme */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setExpenseToDelete(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#262626',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <DeleteIcon sx={{ color: '#ef4444' }} /> Delete Expense
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 2 }}>
          <Typography sx={{ color: 'white', mb: 2 }}>
            Are you sure you want to delete this expense?
          </Typography>
          {expenseToDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 3, 
              bgcolor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Typography sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                <strong>Amount:</strong>
                <span>₹{parseFloat(expenseToDelete.amount).toFixed(2)}</span>
              </Typography>
              <Typography sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                <strong>Section:</strong>
                <span>{expenseToDelete.section || 'None'}</span>
              </Typography>
              <Typography sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                <strong>Date:</strong>
                <span>{new Date(expenseToDelete.createdAt).toLocaleString()}</span>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setExpenseToDelete(null);
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#ef4444',
              color: 'white',
              px: 3,
              '&:hover': {
                bgcolor: '#dc2626'
              }
            }}
            onClick={handleDeleteExpense}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Section Confirmation Dialog */}
      <Dialog
        open={deleteSectionDialogOpen}
        onClose={() => {
          setDeleteSectionDialogOpen(false);
          setSectionToDelete(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#262626',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <DeleteIcon sx={{ color: '#ef4444' }} /> Delete Section
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 2 }}>
          <Typography sx={{ color: 'white', mb: 2 }}>
            Are you sure you want to delete this section?
          </Typography>
          {sectionToDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 3, 
              bgcolor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <strong>Section Name:</strong> {sectionToDelete}
              </Typography>
              <Typography sx={{ 
                mt: 2,
                color: 'rgba(239, 68, 68, 0.8)',
                fontSize: '0.9rem'
              }}>
                Note: All expenses in this section will be moved to "None"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setDeleteSectionDialogOpen(false);
              setSectionToDelete(null);
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#ef4444',
              color: 'white',
              px: 3,
              '&:hover': {
                bgcolor: '#dc2626'
              }
            }}
            onClick={handleDeleteSection}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog 
        open={editExpenseDialogOpen} 
        onClose={() => {
          setEditExpenseDialogOpen(false);
          setEditedExpense({ amount: '', category: '' });
          setExpenseToEdit(null);
          setError('');
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#262626',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <EditIcon sx={{ color: '#8b5cf6' }} /> Edit Expense
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={editedExpense.amount}
            onChange={(e) => setEditedExpense({ ...editedExpense, amount: e.target.value })}
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
              }
            }}
          />
          <FormControl 
            fullWidth 
            sx={{ 
              mt: 2,
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
              value={editedExpense.category}
              label="Category"
              onChange={(e) => setEditedExpense({ ...editedExpense, category: e.target.value })}
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
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem 
                  key={category} 
                  value={category}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setEditExpenseDialogOpen(false);
              setEditedExpense({ amount: '', category: '' });
              setExpenseToEdit(null);
              setError('');
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#8b5cf6',
              color: 'white',
              px: 3,
              '&:hover': {
                bgcolor: '#7c3aed'
              }
            }}
            onClick={handleEditExpense}
            startIcon={<EditIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCategoryClose}
        PaperProps={{
          sx: {
            bgcolor: '#2f2f2f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {categories.map((category) => (
          <MenuItem
            key={category}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              py: 1.5,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
            <Box
              onClick={() => handleCategorySelect(category)}
              sx={{
                flex: 1,
                cursor: 'pointer'
              }}
            >
              {category}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleSectionMenuOpen(e, category)}
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.8)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={sectionMenuAnchorEl}
        open={Boolean(sectionMenuAnchorEl)}
        onClose={handleSectionMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#2f2f2f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <MenuItem
          onClick={() => {
            setSectionToDelete(selectedSection);
            setDeleteSectionDialogOpen(true);
            handleSectionMenuClose();
            handleCategoryClose();
          }}
          sx={{
            color: '#ef4444',
            py: 1.5,
            px: 2,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.1)'
            }
          }}
        >
          <DeleteIcon fontSize="small" />
          Delete Section
        </MenuItem>
      </Menu>
    </>
  );
}

export default Dashboard; 
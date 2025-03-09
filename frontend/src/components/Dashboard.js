import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
  Box,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [username, setUsername] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '' });
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    // Fetch categories and user data
    const fetchData = async () => {
      try {
        const [categoriesRes, userRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/user')
        ]);
        setCategories(categoriesRes.data);
        setUsername(userRes.data.username);
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

  const handleAddExpense = async () => {
    try {
      await axios.post('/api/add-expense', newExpense);
      setExpenseDialogOpen(false);
      setNewExpense({ amount: '', category: '' });
      // Optionally refresh data
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleAddSection = async () => {
    try {
      await axios.post('/api/add-section', { sectionName: newSection });
      setSectionDialogOpen(false);
      setNewSection('');
      // Refresh categories
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Budget Buddy
          </Typography>
          <Button color="inherit" onClick={handleCategoryClick}>
            Spending Category
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCategoryClose}
          >
            {categories.map((category) => (
              <MenuItem
                key={category}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>
          <Button color="inherit">Profile</Button>
          <Button color="inherit">About Us</Button>
          <Button color="inherit">Contact</Button>
          <Button color="inherit" variant="outlined" sx={{ ml: 2 }}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: 'linear-gradient(to right, #92400e, #d97706)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: 20 },
        }}
      >
        <Typography variant="h2" color="white" gutterBottom>
          WELCOME {username},
        </Typography>
        <Typography variant="h5" color="white" sx={{ maxWidth: '2xl', mb: 4 }}>
          "A simple fact that is hard to learn is that the time to save money is when you have some." – Joe Moore
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setExpenseDialogOpen(true)}
          >
            ADD EXPENSE
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ color: 'white', borderColor: 'white' }}
            onClick={() => setSectionDialogOpen(true)}
          >
            ADD SECTION
          </Button>
        </Box>
      </Box>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newExpense.category}
              label="Category"
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddExpense} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={sectionDialogOpen} onClose={() => setSectionDialogOpen(false)}>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Name"
            fullWidth
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSection} variant="contained" color="primary">
            Add Section
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dashboard; 
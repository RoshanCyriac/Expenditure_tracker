import React, { useState } from 'react';
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
} from '@mui/material';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState(['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping']);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '' });
  const [newSection, setNewSection] = useState('');

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

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(to right, #92400e, #d97706)',
          boxShadow: 'none' 
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            Budget Buddy
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleCategoryClick}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Spending Category
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCategoryClose}
            PaperProps={{
              sx: {
                backgroundColor: '#d97706',
                color: 'white'
              }
            }}
          >
            {categories.map((category) => (
              <MenuItem
                key={category}
                onClick={() => handleCategorySelect(category)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>
          <Button 
            color="inherit"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Profile
          </Button>
          <Button 
            color="inherit"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            About Us
          </Button>
          <Button 
            color="inherit"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Contact
          </Button>
          <Button 
            color="inherit" 
            variant="outlined" 
            onClick={handleSignOut}
            sx={{ 
              ml: 2,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
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
        <Typography 
          variant="h2" 
          color="white" 
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          WELCOME {user?.username?.toUpperCase()},
        </Typography>
        <Typography 
          variant="h5" 
          color="white" 
          sx={{ 
            maxWidth: '2xl', 
            mb: 4,
            opacity: 0.9
          }}
        >
          "A simple fact that is hard to learn is that the time to save money is when you have some." – Joe Moore
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: '#92400e',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
            onClick={() => setExpenseDialogOpen(true)}
          >
            ADD EXPENSE
          </Button>
          <Button
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onClick={() => setSectionDialogOpen(true)}
          >
            ADD SECTION
          </Button>
        </Box>
      </Box>

      {/* Add Expense Dialog */}
      <Dialog 
        open={expenseDialogOpen} 
        onClose={() => setExpenseDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#92400e', color: 'white' }}>
          Add Expense
        </DialogTitle>
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
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: '#92400e',
              '&:hover': {
                backgroundColor: '#d97706'
              }
            }}
            onClick={() => setExpenseDialogOpen(false)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog 
        open={sectionDialogOpen} 
        onClose={() => setSectionDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#92400e', color: 'white' }}>
          Add New Section
        </DialogTitle>
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
          <Button 
            variant="contained"
            sx={{ 
              backgroundColor: '#92400e',
              '&:hover': {
                backgroundColor: '#d97706'
              }
            }}
            onClick={() => setSectionDialogOpen(false)}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dashboard; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d97706', // amber-600
    },
    secondary: {
      main: '#92400e', // amber-800
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions/:category" element={<TransactionsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

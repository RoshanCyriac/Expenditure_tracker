import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Attempting to connect to:', API_URL);
        const response = await axios.get(`${API_URL}/api/test`);
        setStatus(response.data.message);
      } catch (err) {
        console.error('Full error:', err);
        setError('Failed to connect to backend: ' + err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Backend Connection Status:</Typography>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Alert severity="info">{status}</Alert>
      )}
    </Box>
  );
};

export default TestConnection; 
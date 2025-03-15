import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        username,
        email,
        password
      });
      login(response.data);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
        (error.response?.status === 400 ? 'Please check your input and try again.' : 'Sign up failed. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              color: '#8b5cf6',
              fontWeight: 800,
              mb: 4,
              letterSpacing: '-0.5px'
            }}
          >
            Budget Buddy
          </Typography>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              bgcolor: '#262626',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                mb: 3
              }}
            >
              Create an Account
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
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
            )}

            <form onSubmit={handleSignUp}>
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
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

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
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
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&:hover': {
                            color: 'rgba(255, 255, 255, 0.8)'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                error={error === 'Passwords do not match'}
                helperText={error === 'Passwords do not match' ? error : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&:hover': {
                            color: 'rgba(255, 255, 255, 0.8)'
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444'
                  }
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: '#8b5cf6',
                  color: 'white',
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
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign Up'}
              </Button>
            </form>

            <Box 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Typography 
                variant="body2" 
                component="span"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: '#262626',
                  px: 2,
                  position: 'relative'
                }}
              >
                or continue with
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignUp}
              disabled={loading}
              startIcon={<img src="/google-icon.png" alt="Google" width="20" />}
              sx={{
                mt: 2,
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textTransform: 'none',
                fontSize: '0.95rem',
                py: 1.2,
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Already have an account?{' '}
                <Button
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={{
                    color: '#8b5cf6',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SignUp; 
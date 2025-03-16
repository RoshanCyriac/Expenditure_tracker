const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Account not found. Please sign up first.',
        type: 'NOT_FOUND'
      });
    }

    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ 
        message: 'Incorrect password. Please try again.',
        type: 'INVALID_PASSWORD'
      });
    }

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login.',
      type: 'SERVER_ERROR'
    });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username already exists. Please choose another.',
        type: 'USERNAME_EXISTS'
      });
    }

    // Create new user
    const user = await User.create({ username, password, email });
    
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'An error occurred during signup.',
      type: 'SERVER_ERROR'
    });
  }
});

module.exports = router; 
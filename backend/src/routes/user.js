const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Get user account info
router.get('/account-info', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user account info:', error);
    res.status(500).json({ message: 'Failed to fetch account information' });
  }
});

module.exports = router; 
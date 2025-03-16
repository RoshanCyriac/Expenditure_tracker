const express = require('express');
const router = express.Router();
const passport = require('passport');
const SavingsTarget = require('../models/SavingsTarget');

// Get user's savings target
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const target = await SavingsTarget.findOne({
      where: { userId: req.user.id }
    });
    res.json(target);
  } catch (error) {
    console.error('Error fetching savings target:', error);
    res.status(500).json({ message: 'Error fetching savings target' });
  }
});

// Create or update savings target
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { amount, period } = req.body;
    
    // Validate input
    if (!amount || !period) {
      return res.status(400).json({ message: 'Amount and period are required' });
    }
    
    if (!['daily', 'monthly', 'yearly'].includes(period)) {
      return res.status(400).json({ message: 'Invalid period' });
    }

    // Update or create target
    const [target, created] = await SavingsTarget.upsert({
      userId: req.user.id,
      amount,
      period
    }, {
      where: { userId: req.user.id }
    });

    res.json(target);
  } catch (error) {
    console.error('Error saving savings target:', error);
    res.status(500).json({ message: 'Error saving savings target' });
  }
});

module.exports = router; 
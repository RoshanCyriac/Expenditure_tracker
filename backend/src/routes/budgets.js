const express = require('express');
const router = express.Router();
const passport = require('passport');
const Budget = require('../models/Budget');

// Get all budgets for a user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id }
    });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
});

// Save budgets
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete existing budgets for this user
    await Budget.destroy({
      where: { userId: userId }
    });

    // Create new budgets
    const budgets = req.body.map(budget => ({
      ...budget,
      userId: userId
    }));
    
    const savedBudgets = await Budget.bulkCreate(budgets);
    res.json(savedBudgets);
  } catch (error) {
    console.error('Error saving budgets:', error);
    res.status(500).json({ message: 'Failed to save budgets' });
  }
});

module.exports = router; 
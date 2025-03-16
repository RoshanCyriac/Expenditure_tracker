const express = require('express');
const router = express.Router();
const passport = require('passport');
const FixedCost = require('../models/FixedCost');

// Get all fixed costs for a user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const fixedCosts = await FixedCost.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(fixedCosts);
  } catch (error) {
    console.error('Error fetching fixed costs:', error);
    res.status(500).json({ message: 'Failed to fetch fixed costs' });
  }
});

// Add a new fixed cost
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name, amount } = req.body;
    
    if (!name || !amount) {
      return res.status(400).json({ message: 'Name and amount are required' });
    }

    const fixedCost = await FixedCost.create({
      name,
      amount,
      userId: req.user.id
    });

    res.status(201).json(fixedCost);
  } catch (error) {
    console.error('Error creating fixed cost:', error);
    res.status(500).json({ message: 'Failed to create fixed cost' });
  }
});

// Update a fixed cost
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name, amount } = req.body;
    const { id } = req.params;

    const fixedCost = await FixedCost.findOne({
      where: { id, userId: req.user.id }
    });

    if (!fixedCost) {
      return res.status(404).json({ message: 'Fixed cost not found' });
    }

    await fixedCost.update({ name, amount });
    res.json(fixedCost);
  } catch (error) {
    console.error('Error updating fixed cost:', error);
    res.status(500).json({ message: 'Failed to update fixed cost' });
  }
});

// Delete a fixed cost
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const fixedCost = await FixedCost.findOne({
      where: { id, userId: req.user.id }
    });

    if (!fixedCost) {
      return res.status(404).json({ message: 'Fixed cost not found' });
    }

    await fixedCost.destroy();
    res.json({ message: 'Fixed cost deleted successfully' });
  } catch (error) {
    console.error('Error deleting fixed cost:', error);
    res.status(500).json({ message: 'Failed to delete fixed cost' });
  }
});

// Get total fixed costs for a user
router.get('/total', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const fixedCosts = await FixedCost.findAll({
      where: { userId: req.user.id }
    });
    
    const total = fixedCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
    res.json({ total });
  } catch (error) {
    console.error('Error calculating total fixed costs:', error);
    res.status(500).json({ message: 'Failed to calculate total fixed costs' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Section = require('../models/Section');
const Expense = require('../models/Expense');

// Get all sections for a user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { userId: req.user.id }
    });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
});

// Add a new section
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if section already exists
    const existingSection = await Section.findOne({
      where: { name, userId: req.user.id }
    });

    if (existingSection) {
      return res.status(400).json({ message: 'Section already exists' });
    }

    const section = await Section.create({
      name,
      userId: req.user.id
    });
    
    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Failed to create section' });
  }
});

// Delete a section
router.delete('/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name } = req.params;
    
    const section = await Section.findOne({
      where: { name, userId: req.user.id }
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Update expenses in this section to have no section
    await Expense.update(
      { section: '' },
      {
        where: {
          userId: req.user.id,
          section: name
        }
      }
    );

    await section.destroy();
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Failed to delete section' });
  }
});

// Get section transactions
router.get('/:section/transactions', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { section } = req.params;
    const transactions = await Expense.findAll({
      where: {
        userId: req.user.id,
        section: section
      },
      order: [['createdAt', 'DESC']]
    });

    // Calculate total
    const total = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Calculate average per day
    const dates = transactions.map(t => t.createdAt.toDateString());
    const uniqueDays = new Set(dates).size;
    const averagePerDay = uniqueDays > 0 ? total / uniqueDays : 0;

    res.json({
      transactions,
      total,
      averagePerDay
    });
  } catch (error) {
    console.error('Error fetching section transactions:', error);
    res.status(500).json({ message: 'Failed to fetch section transactions' });
  }
});

module.exports = router; 
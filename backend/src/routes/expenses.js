const express = require('express');
const router = express.Router();
const passport = require('passport');
const Expense = require('../models/Expense');
const { Op } = require('sequelize');

// Get all expenses for a user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Add a new expense
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { amount, section } = req.body;
    const expense = await Expense.create({
      amount,
      section,
      userId: req.user.id
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// Update an expense
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, section } = req.body;
    
    const expense = await Expense.findOne({
      where: { id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.update({ amount, section });
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Delete an expense
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({
      where: { id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

// Get monthly expense analytics
router.get('/monthly/:month', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { month } = req.params; // Format: YYYY-MM
    const startDate = new Date(`${month}-01`);
    const endDate = new Date();
    
    // If selected month is current month, use current date as end date
    // Otherwise, use last day of selected month
    if (month !== endDate.toISOString().slice(0, 7)) {
      endDate.setFullYear(startDate.getFullYear());
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0); // Last day of selected month
    }
    
    // Get current month's expenses
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Get previous month's expenses for trend calculation
    const prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const prevEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
    const prevExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    });

    // Calculate totals
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const prevTotal = prevExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Calculate daily average based on actual days elapsed
    const daysPassed = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dailyAverage = total / daysPassed;

    // Calculate trend (percentage change from previous month)
    // For current month, normalize the comparison
    let trend;
    if (month === new Date().toISOString().slice(0, 7)) {
      // Normalize current month's total to full month projection
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const projectedTotal = (total / daysPassed) * daysInMonth;
      trend = prevTotal === 0 ? 0 : ((projectedTotal - prevTotal) / prevTotal) * 100;
    } else {
      trend = prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;
    }

    // Calculate category breakdown
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.section || 'Uncategorized';
      categories[category] = (categories[category] || 0) + parseFloat(expense.amount);
    });

    const categoryBreakdown = Object.entries(categories).map(([name, total]) => ({
      name,
      total
    })).sort((a, b) => b.total - a.total);

    res.json({
      total,
      dailyAverage,
      trend,
      categories: categoryBreakdown,
      expenseCount: expenses.length,
      daysInPeriod: daysPassed,
      isCurrentMonth: month === new Date().toISOString().slice(0, 7)
    });
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ message: 'Failed to fetch monthly expenses' });
  }
});

module.exports = router; 
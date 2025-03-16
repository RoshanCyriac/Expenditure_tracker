const express = require('express');
const router = express.Router();
const passport = require('passport');
const VirtualSavings = require('../models/VirtualSavings');
const { Op } = require('sequelize');

// Get virtual savings summary
router.get('/summary', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    
    const endDate = new Date();
    
    const savings = await VirtualSavings.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const totalSavings = savings.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const dailyAverage = savings.length > 0 ? totalSavings / savings.length : 0;

    res.json({
      totalSavings,
      dailyAverage,
      savingsHistory: savings
    });
  } catch (error) {
    console.error('Error fetching virtual savings:', error);
    res.status(500).json({ error: 'Failed to fetch virtual savings' });
  }
});

// Save virtual savings for a day
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { date, amount, dailyBudget, actualSpent } = req.body;
    
    // Create or update virtual savings for the day
    const [savings, created] = await VirtualSavings.findOrCreate({
      where: {
        userId: req.user.id,
        date: date
      },
      defaults: {
        amount,
        dailyBudget,
        actualSpent
      }
    });

    if (!created) {
      await savings.update({
        amount,
        dailyBudget,
        actualSpent
      });
    }

    res.json(savings);
  } catch (error) {
    console.error('Error saving virtual savings:', error);
    res.status(500).json({ error: 'Failed to save virtual savings' });
  }
});

// Get monthly savings analytics
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
    
    // Get current month's savings
    const savings = await VirtualSavings.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Get previous month's savings for trend calculation
    const prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const prevEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
    const prevSavings = await VirtualSavings.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    });

    // Calculate totals
    const total = savings.reduce((sum, save) => sum + parseFloat(save.amount), 0);
    const prevTotal = prevSavings.reduce((sum, save) => sum + parseFloat(save.amount), 0);

    // Calculate daily average based on days with savings
    const daysWithSavings = savings.length;
    const dailyAverage = daysWithSavings > 0 ? total / daysWithSavings : 0;

    // Calculate trend (percentage change from previous month)
    // For current month, normalize the comparison
    let trend;
    if (month === new Date().toISOString().slice(0, 7)) {
      // Normalize current month's total to full month projection
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const projectedTotal = (total / daysWithSavings) * daysInMonth;
      trend = prevTotal === 0 ? 0 : ((projectedTotal - prevTotal) / prevTotal) * 100;
    } else {
      trend = prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;
    }

    const daysPassed = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    res.json({
      total,
      dailyAverage,
      trend,
      daysWithSavings,
      daysInPeriod: daysPassed,
      isCurrentMonth: month === new Date().toISOString().slice(0, 7),
      savingsHistory: savings.map(s => ({
        date: s.date,
        amount: parseFloat(s.amount),
        dailyBudget: parseFloat(s.dailyBudget),
        actualSpent: parseFloat(s.actualSpent)
      }))
    });
  } catch (error) {
    console.error('Error fetching monthly savings:', error);
    res.status(500).json({ message: 'Failed to fetch monthly savings' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get transactions for a specific section
router.get('/:section/transactions', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const userId = req.user.id;

    // Get all transactions for this section
    const transactions = await db.query(
      'SELECT * FROM expenses WHERE user_id = $1 AND section = $2 ORDER BY created_at DESC',
      [userId, section]
    );

    // Calculate total
    const total = transactions.rows.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Calculate average per day
    const dates = transactions.rows.map(t => new Date(t.created_at).toDateString());
    const uniqueDays = new Set(dates).size;
    const averagePerDay = uniqueDays > 0 ? total / uniqueDays : 0;

    res.json({
      transactions: transactions.rows,
      total,
      averagePerDay
    });
  } catch (error) {
    console.error('Error fetching section transactions:', error);
    res.status(500).json({ message: 'Error fetching section transactions' });
  }
});

// Add other section-related routes here...

module.exports = router; 
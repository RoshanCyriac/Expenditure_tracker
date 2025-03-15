require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./models/User');
const Section = require('./models/Section');
const Expense = require('./models/Expense');
const sequelize = require('./config/database');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Make Google OAuth conditional
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ where: { googleId: profile.id } });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              username: profile.displayName,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = await User.create({ username, password, email });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ 
      message: 'An error occurred during login.',
      type: 'SERVER_ERROR'
    });
  }
});

// Google OAuth routes
app.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET || 'your-secret-key'
    );
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  }
);

// Protected route example
app.get(
  '/api/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: 'Protected route accessed successfully', user: req.user });
  }
);

// Add this route near your other routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected!' });
});

// Get categories
app.get('/api/categories', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { userId: req.user.id },
      attributes: ['name']
    });
    const sectionNames = sections.map(section => section.name);
    res.json(sectionNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Add expense
app.post('/api/add-expense', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { amount, category } = req.body;
    const expense = await Expense.create({
      amount,
      section: category,
      userId: req.user.id
    });
    res.json({ message: 'Expense added successfully', expense });
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
});

// Get recent expenses
app.get('/api/recent-expenses', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Add section/category
app.post('/api/add-section', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { sectionName } = req.body;
    
    // Check if section already exists for this user
    const existingSection = await Section.findOne({
      where: {
        userId: req.user.id,
        name: sectionName
      }
    });

    if (existingSection) {
      return res.status(400).json({ message: 'Section already exists' });
    }

    // Create new section
    const section = await Section.create({
      name: sectionName,
      userId: req.user.id
    });

    res.json({ message: 'Section added successfully', section });
  } catch (error) {
    res.status(500).json({ message: 'Error adding section' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the expense
    const expense = await Expense.findOne({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    // Check if expense exists and belongs to the user
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    // Delete the expense
    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

// Delete section
app.delete('/api/sections/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name } = req.params;
    
    // Find the section
    const section = await Section.findOne({
      where: {
        name: name,
        userId: req.user.id
      }
    });

    // Check if section exists and belongs to the user
    if (!section) {
      return res.status(404).json({ message: 'Section not found or unauthorized' });
    }

    // Update all expenses in this section to have no section
    await Expense.update(
      { section: '' },
      {
        where: {
          userId: req.user.id,
          section: name
        }
      }
    );

    // Delete the section
    await section.destroy();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Error deleting section' });
  }
});

// Update expense
app.put('/api/expenses/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, section } = req.body;
    
    // Find the expense
    const expense = await Expense.findOne({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    // Check if expense exists and belongs to the user
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    // Update the expense
    await expense.update({
      amount: amount,
      section: section
    });

    // Get the updated expense
    const updatedExpense = await Expense.findByPk(expense.id);
    res.json({ message: 'Expense updated successfully', expense: updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense' });
  }
});

// Database sync and server start
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}); 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./models/User');
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
    // For now, return some dummy categories
    const categories = ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping'];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Add expense
app.post('/api/add-expense', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { amount, category } = req.body;
    // Here you would typically save the expense to your database
    // For now, just return success
    res.json({ message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
});

// Add section/category
app.post('/api/add-section', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { sectionName } = req.body;
    // Here you would typically save the new category to your database
    // For now, just return success
    res.json({ message: 'Section added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding section' });
  }
});

// Database sync and server start
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}); 
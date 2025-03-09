import 'dotenv/config';
import express from 'express';
import path from 'path';
import bodyParser from "body-parser";
import pkg from "pg";
import { fileURLToPath } from "url";
import session from 'express-session';
import connectPgSimple from "connect-pg-simple";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {  signInUser } from './email.js';

const PgSession = connectPgSimple(session);
const app = express();
const port = process.env.PORT || 5000;
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Test database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to database');
        done();
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    store: new connectPgSimple({
        pool: pool,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

// Auth routes
app.post('/api/register', async(req, res) => {
    const { email, username, password, phonenumber } = req.body;
    try {
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2 OR phone_number = $3",
            [username, email, phonenumber]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username, email, or phone number already taken' });
        }

        const result = await pool.query(
            "INSERT INTO users(username, email, password, phone_number) VALUES($1, $2, $3, $4) RETURNING id",
            [username, email, password, phonenumber]
        );
        
        res.json({ success: true, userId: result.rows[0].id });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

app.post('/api/login', async(req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            "SELECT id, password FROM users WHERE username = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Username not found" });
        }

        const user = result.rows[0];
        if (password === user.password) {
            req.session.userId = user.id;
            await req.session.save();
            res.json({ success: true });
        } else {
            res.status(401).json({ message: "Password incorrect" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ success: true });
    });
});

// Protected routes
app.get('/api/user', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [req.session.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ username: result.rows[0].username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.get('/api/categories', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT section_name FROM user_sections WHERE user_id = $1",
            [req.session.userId]
        );
        const categories = result.rows.map(row => row.section_name);
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.post("/api/add-section", requireAuth, async (req, res) => {
    const { sectionName } = req.body;
    if (!sectionName) {
        return res.status(400).json({ message: "Section name is required" });
    }

    try {
        await pool.query(
            "INSERT INTO user_sections (user_id, section_name, created_at) VALUES ($1, $2, NOW())", 
            [req.session.userId, sectionName]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.post("/api/add-expense", requireAuth, async (req, res) => {
    const { amount, category } = req.body;
    if (!amount || !category) {
        return res.status(400).json({ message: "Amount and category are required" });
    }

    try {
        await pool.query(
            `INSERT INTO user_transactions(user_id, section_id, amount, created_at) 
            VALUES ($1, (SELECT section_id FROM user_sections WHERE section_name = $2 AND user_id = $1), $3, NOW())`,
            [req.session.userId, category, amount]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.get('/api/transactions/:category', requireAuth, async (req, res) => {
    const category = req.params.category;

    try {
        const transactionsQuery = await pool.query(
            `SELECT 
                t.transaction_id as id,
                t.amount, 
                t.created_at 
            FROM user_transactions t
            JOIN user_sections s ON t.section_id = s.section_id
            WHERE t.user_id = $1 AND s.section_name = $2
            ORDER BY t.created_at DESC`,
            [req.session.userId, category]
        );
        
        const sumQuery = await pool.query(
            `SELECT SUM(t.amount) AS total_amount 
            FROM user_transactions t
            JOIN user_sections s ON t.section_id = s.section_id
            WHERE t.user_id = $1 AND s.section_name = $2`,
            [req.session.userId, category]
        );

        res.json({
            transactions: transactionsQuery.rows,
            totalAmount: sumQuery.rows[0].total_amount || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
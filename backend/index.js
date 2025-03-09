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
const port = 5000;
const { Pool } = pkg;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "expenditure",
    password: "Roshan@7408",
    port: 5432,
});
pool.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: "session"
    }),
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Serve static files from React build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Authentication endpoints
app.post('/api/validate-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const auth = getAuth();
        let user;

        try {
            user = await getUserByEmail(auth, email);
        } catch (error) {
            user = null;
        }

        if (!user) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, 'defaultpassword');
            user = userCredential.user;
            await sendEmailVerification(user);
            return res.status(200).json({
                message: 'Registration successful. Verification email sent. Please check your inbox.',
            });
        }

        if (!user.emailVerified) {
            await sendEmailVerification(user);
            return res.status(200).json({
                message: 'Verification email sent. Please check your inbox.',
            });
        } else {
            return res.status(200).json({ message: 'Email is already verified. You can proceed to login.' });
        }
    } catch (error) {
        console.error('Error during registration or verification:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/register', async(req,res) => {
    const { email, username, password, phonenumber } = req.body;
    try {
        const phonenumber_search = await pool.query("SELECT phone_number FROM users WHERE phone_number LIKE $1", [`%${phonenumber}%`]);
        const username_search = await pool.query("SELECT username FROM users WHERE username LIKE $1", [`%${username}%`]);
        const email_search = await pool.query("SELECT email FROM users WHERE email LIKE $1", [`%${email}%`]);
        
        if (username_search.rows.length === 0 && email_search.rows.length === 0 && phonenumber_search.rows.length === 0) {
            await pool.query(
                "INSERT INTO users(username, email, password, phone_number) VALUES($1, $2, $3, $4)",
                [username, email, password, phonenumber]
            );
            res.json({ success: true });
        } else {
            res.status(400).json({ message: 'Username, email, or phone number already taken' });
        }
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

app.post('/api/login', async(req,res) => {
    const { login_username, login_password } = req.body;
    try {
        const username_search = await pool.query("SELECT username FROM users WHERE username LIKE $1", [`%${login_username}%`]);

        if (username_search.rows.length === 0) {
            res.status(404).json({ message: "Username not found" });
        } else {
            const username_result = username_search.rows[0].username;
            const userQuery = await pool.query("SELECT id, password FROM users WHERE username = $1", [login_username]);

            const userId = userQuery.rows[0].id;
            const password_result = userQuery.rows[0].password;

            if (login_password === password_result) {
                req.session.userId = userId;
                await req.session.save();
                res.json({ success: true });
            } else {
                res.status(401).json({ message: "Password incorrect" });
            }
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

// Session check endpoint
app.get('/api/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ message: "Session found", userId: req.session.userId });
    } else {
        res.status(401).json({ message: "No session found" });
    }
});

// API Routes
app.get('/api/categories', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const category_query = await pool.query(
            "SELECT section_name FROM user_sections WHERE user_id = $1",
            [req.session.userId]
        );
        const categories = category_query.rows.map(row => row.section_name);
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.get('/api/user', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userQuery = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [req.session.userId]
        );
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ username: userQuery.rows[0].username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});

app.get('/api/transactions/:category', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
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
            [userId, category]
        );
        
        const sumQuery = await pool.query(
            `SELECT SUM(t.amount) AS total_amount 
            FROM user_transactions t
            JOIN user_sections s ON t.section_id = s.section_id
            WHERE t.user_id = $1 AND s.section_name = $2`,
            [userId, category]
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

app.post("/api/add-expense", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

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

app.post("/api/add-section", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

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

// Catch-all route to serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
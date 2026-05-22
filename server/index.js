import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Postgres connection
// The user needs to replace [YOUR-PASSWORD] in .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Needed for Supabase connections
});

// Create tables if they don't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        balance NUMERIC NOT NULL DEFAULT 100,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database (check your password in .env):", err.message);
  }
};

initDB();

// Get top 20 players by balance
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT username, balance, games_played, wins 
      FROM leaderboards 
      ORDER BY balance DESC 
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update or create player score
app.post('/api/leaderboard', async (req, res) => {
  const { username, balance, gamesPlayed, wins } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const result = await pool.query(`
      INSERT INTO leaderboards (username, balance, games_played, wins, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (username) 
      DO UPDATE SET 
        balance = $2, 
        games_played = $3, 
        wins = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [username, balance, gamesPlayed, wins]);
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

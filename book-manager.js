const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

// PostgreSQL connection setup
const pool = new Pool({
  user:
    process.env.CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_USERNAME ||
    "your_db_user",
  host:
    process.env.CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_HOSTNAME ||
    "localhost",
  database:
    process.env
      .CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_DATABASENAME ||
    "your_db_name",
  password:
    process.env.CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_PASSWORD ||
    "your_db_password",
  port: process.env.CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_PORT
    ? parseInt(
        process.env.CHOREO_CONNECTION_CHOREO_MCP_VIBE_DEPLOY_DEFAULTDB_PORT
      )
    : 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

// POST /books – add a book to the bookstore
app.post("/books", async (req, res) => {
  const { name, author } = req.body;
  if (!name || !author) {
    return res.status(400).json({ error: "Name and author are required." });
  }
  const id = uuidv4();
  try {
    const result = await pool.query(
      "INSERT INTO books (id, name, author) VALUES ($1, $2, $3) RETURNING *",
      [id, name, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
});

// GET /books – get all the books
app.get("/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
});

// GET /books/:id – get specific book by id
app.get("/books/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
});

// Migration: Create books table if it doesn't exist
async function runMigrations() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      author text NOT NULL
    );
  `;
  await pool.query(createTableQuery);
}

// Seed: Insert 4 books if table is empty
async function runSeeds() {
  const checkCount = await pool.query("SELECT COUNT(*) FROM books");
  if (parseInt(checkCount.rows[0].count, 10) === 0) {
    const books = [
      { id: uuidv4(), name: "To Kill a Mockingbird", author: "Harper Lee" },
      { id: uuidv4(), name: "1984", author: "George Orwell" },
      { id: uuidv4(), name: "The Great Gatsby", author: "F. Scott Fitzgerald" },
      { id: uuidv4(), name: "Pride and Prejudice", author: "Jane Austen" },
    ];
    for (const book of books) {
      await pool.query(
        "INSERT INTO books (id, name, author) VALUES ($1, $2, $3)",
        [book.id, book.name, book.author]
      );
    }
    console.log("Seeded 4 books into the database.");
  }
}

// Initialize DB and then start server
(async () => {
  try {
    await runMigrations();
    await runSeeds();
    app.listen(port, () => {
      console.log(`Book manager service running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
})();

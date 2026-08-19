const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

app.use(express.static(__dirname));


/* =========================
   DATABASE
========================= */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl
    ? { rejectUnauthorized: false }
    : false
});


/* =========================
   DATABASE INITIALIZATION
========================= */

async function initDatabase() {

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is missing."
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS aiflow_leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'New',
      source VARCHAR(100) DEFAULT 'Website',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM aiflow_leads"
  );


  if (result.rows[0].count === 0) {

    await pool.query(`
      INSERT INTO aiflow_leads
      (name, email, status, source)

      VALUES
      (
        'Demo Client',
        'client@example.com',
        'New',
        'Website'
      ),
      (
        'Sarah Johnson',
        'sarah@example.com',
        'Qualified',
        'Upwork'
      );
    `);

  }


  console.log(
    "AIFlow PostgreSQL database ready"
  );
}


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", async (req, res) => {

  try {

    await pool.query("SELECT 1");

    res.json({
      ok: true,
      service: "AIFlow Studio",
      database: "connected"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      database: "error"
    });

  }

});


/* =========================
   GET LEADS
========================= */

app.get("/api/leads", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        status,
        source,
        created_at

      FROM aiflow_leads

      ORDER BY id DESC
    `);


    res.json(result.rows);

  } catch (error) {

    console.error(
      "GET /api/leads:",
      error
    );

    res.status(500).json({
      error: "Unable to load leads"
    });

  }

});


/* =========================
   CREATE LEAD
========================= */

app.post("/api/leads", async (req, res) => {

  try {

    const {
      name,
      email,
      source = "Website"
    } = req.body;


    if (!name || !email) {

      return res.status(400).json({
        error: "Name and email are required"
      });

    }


    const result = await pool.query(
      `
      INSERT INTO aiflow_leads
      (
        name,
        email,
        status,
        source
      )

      VALUES
      (
        $1,
        $2,
        'New',
        $3
      )

      RETURNING *
      `,
      [
        name.trim(),
        email.trim(),
        source
      ]
    );


    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {

    console.error(
      "POST /api/leads:",
      error
    );

    res.status(500).json({
      error: "Unable to create lead"
    });

  }

});


/* =========================
   AI CHAT DEMO
========================= */

app.post("/api/chat", (req, res) => {

  const message =
    String(
      req.body.message || ""
    ).trim();


  if (!message) {

    return res.status(400).json({
      error: "Message is required"
    });

  }


  res.json({

    reply:
      `Demo AI response: I received "${message}". ` +
      `AI provider integration can be connected later.`

  });

});


/* =========================
   START SERVER
========================= */

async function start() {

  try {

    await initDatabase();


    app.listen(
      PORT,
      () => {

        console.log(
          `AIFlow Studio running on port ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Database startup error:",
      error
    );

    process.exit(1);

  }

}


start();

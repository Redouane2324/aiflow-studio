require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is missing.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is missing.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later."
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", apiLimiter);

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(150),
      source VARCHAR(100),
      status VARCHAR(30) DEFAULT 'new',
      value NUMERIC(12,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leads_user_id
      ON leads(user_id);

    CREATE INDEX IF NOT EXISTS idx_leads_status
      ON leads(status);

    CREATE INDEX IF NOT EXISTS idx_leads_created_at
      ON leads(created_at);
  `);

  console.log("Database initialized.");
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required."
    });
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token."
    });
  }
}

function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const allowedStatuses = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost"
];

/* ---------------- AUTH ---------------- */

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        error: "Name must contain at least 2 characters."
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters."
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length) {
      return res.status(409).json({
        error: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
      `,
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Account created successfully.",
      token: createToken(user),
      user
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      error: "Unable to create account."
    });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    delete user.password_hash;

    res.json({
      message: "Login successful.",
      token: createToken(user),
      user
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Unable to login."
    });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load profile."
    });
  }
});

/* ---------------- LEADS ---------------- */

app.get("/api/leads", authMiddleware, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const values = [req.user.id];
    let conditions = ["user_id = $1"];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          name ILIKE $${values.length}
          OR email ILIKE $${values.length}
          OR company ILIKE $${values.length}
          OR phone ILIKE $${values.length}
        )
      `);
    }

    if (status && allowedStatuses.includes(status)) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        company,
        source,
        status,
        value,
        notes,
        created_at,
        updated_at
      FROM leads
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      `,
      values
    );

    res.json({
      leads: result.rows
    });
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      error: "Unable to load leads."
    });
  }
});

app.post("/api/leads", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      value,
      notes
    } = req.body;

    const leadName = String(name || "").trim();

    if (!leadName) {
      return res.status(400).json({
        error: "Lead name is required."
      });
    }

    const leadStatus = allowedStatuses.includes(status)
      ? status
      : "new";

    const numericValue = Number(value || 0);

    const result = await pool.query(
      `
      INSERT INTO leads
      (
        user_id,
        name,
        email,
        phone,
        company,
        source,
        status,
        value,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        req.user.id,
        leadName,
        String(email || "").trim(),
        String(phone || "").trim(),
        String(company || "").trim(),
        String(source || "").trim(),
        leadStatus,
        Number.isFinite(numericValue) ? numericValue : 0,
        String(notes || "").trim()
      ]
    );

    res.status(201).json({
      message: "Lead created.",
      lead: result.rows[0]
    });
  } catch (error) {
    console.error("Create lead error:", error);

    res.status(500).json({
      error: "Unable to create lead."
    });
  }
});

app.put("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid lead ID."
      });
    }

    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      value,
      notes
    } = req.body;

    if (!String(name || "").trim()) {
      return res.status(400).json({
        error: "Lead name is required."
      });
    }

    const leadStatus = allowedStatuses.includes(status)
      ? status
      : "new";

    const numericValue = Number(value || 0);

    const result = await pool.query(
      `
      UPDATE leads
      SET
        name = $1,
        email = $2,
        phone = $3,
        company = $4,
        source = $5,
        status = $6,
        value = $7,
        notes = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
        AND user_id = $10
      RETURNING *
      `,
      [
        String(name).trim(),
        String(email || "").trim(),
        String(phone || "").trim(),
        String(company || "").trim(),
        String(source || "").trim(),
        leadStatus,
        Number.isFinite(numericValue) ? numericValue : 0,
        String(notes || "").trim(),
        id,
        req.user.id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Lead not found."
      });
    }

    res.json({
      message: "Lead updated.",
      lead: result.rows[0]
    });
  } catch (error) {
    console.error("Update lead error:", error);

    res.status(500).json({
      error: "Unable to update lead."
    });
  }
});

app.delete("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      `
      DELETE FROM leads
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Lead not found."
      });
    }

    res.json({
      message: "Lead deleted."
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      error: "Unable to delete lead."
    });
  }
});

/* ---------------- DASHBOARD ---------------- */

app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'new')::int AS new,
        COUNT(*) FILTER (WHERE status = 'contacted')::int AS contacted,
        COUNT(*) FILTER (WHERE status = 'qualified')::int AS qualified,
        COUNT(*) FILTER (WHERE status = 'won')::int AS won,
        COUNT(*) FILTER (WHERE status = 'lost')::int AS lost,
        COALESCE(SUM(value), 0)::numeric AS total_value,
        COALESCE(
          SUM(value) FILTER (WHERE status = 'won'),
          0
        )::numeric AS won_value
      FROM leads
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    res.json({
      stats: result.rows[0]
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      error: "Unable to load dashboard."
    });
  }
});

/* ---------------- HEALTH ---------------- */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      service: "AIFlow Studio",
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/* ---------------- FRONTEND ---------------- */

app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "API endpoint not found."
    });
  }

  res.sendFile(path.join(__dirname, "index.html"));
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error."
  });
});

/* ---------------- START ---------------- */

async function start() {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`AIFlow Studio running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

start();

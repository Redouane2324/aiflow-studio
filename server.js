const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.use(express.static(__dirname));

let leads = [
  {
    id: 1,
    name: "Demo Client",
    email: "client@example.com",
    status: "New",
    source: "Website"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    status: "Qualified",
    source: "Upwork"
  }
];

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "AIFlow Studio"
  });
});

app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.post("/api/chat", (req, res) => {
  const message = String(req.body.message || "").trim();

  if (!message) {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  res.json({
    reply:
      `Demo AI response: I received "${message}". ` +
      `Connect OPENAI_API_KEY later to enable live AI.`
  });
});

app.post("/api/leads", (req, res) => {
  const { name, email, source = "Website" } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "Name and email are required"
    });
  }

  const lead = {
    id: leads.length + 1,
    name,
    email,
    status: "New",
    source
  };

  leads.push(lead);

  res.status(201).json(lead);
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`AIFlow Studio running on port ${PORT}`);
});

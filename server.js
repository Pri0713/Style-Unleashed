const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { initDb, run, get, all } = require("./db");
const { buildRecommendation } = require("./recommendationEngine");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fashion-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.use(express.static(path.join(__dirname)));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hash]
    );
    req.session.userId = result.lastID;
    res.json({ message: "Registered successfully." });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Email already exists." });
    }
    return res.status(500).json({ error: "Unable to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const user = await get("SELECT * FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });

    req.session.userId = user.id;
    return res.json({ message: "Login successful." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to login." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) return res.json({ authenticated: false });
  const user = await get("SELECT id, name, email FROM users WHERE id = ?", [req.session.userId]);
  if (!user) return res.json({ authenticated: false });
  return res.json({ authenticated: true, user });
});

app.get("/api/preferences", requireAuth, async (req, res) => {
  const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
  res.json({ preferences: prefs || null });
});

app.put("/api/preferences", requireAuth, async (req, res) => {
  const { gender, bodyType, skinTone, height, stylePreference } = req.body;
  await run(
    `
      INSERT INTO user_preferences (user_id, gender, body_type, skin_tone, height, style_preference, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        gender = excluded.gender,
        body_type = excluded.body_type,
        skin_tone = excluded.skin_tone,
        height = excluded.height,
        style_preference = excluded.style_preference,
        updated_at = CURRENT_TIMESTAMP
    `,
    [req.session.userId, gender, bodyType, skinTone, height, stylePreference]
  );
  res.json({ message: "Preferences saved." });
});

app.post("/api/recommendations", requireAuth, async (req, res) => {
  const { occasion, season } = req.body;
  if (!occasion || !season) {
    return res.status(400).json({ error: "Occasion and season are required." });
  }

  const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
  if (!prefs) {
    return res.status(400).json({ error: "Please save your base preferences first." });
  }

  const recommendation = buildRecommendation({
    gender: prefs.gender,
    bodyType: prefs.body_type,
    skinTone: prefs.skin_tone,
    height: prefs.height,
    stylePreference: prefs.style_preference,
    occasion,
    season,
  });

  await run(
    "INSERT INTO recommendations (user_id, occasion, season, generated_output) VALUES (?, ?, ?, ?)",
    [req.session.userId, occasion, season, JSON.stringify(recommendation)]
  );

  res.json({ recommendation });
});

app.get("/api/recommendations/history", requireAuth, async (req, res) => {
  const rows = await all(
    `
      SELECT id, occasion, season, generated_output, created_at
      FROM recommendations
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT 20
    `,
    [req.session.userId]
  );

  const history = rows.map((r) => ({
    id: r.id,
    occasion: r.occasion,
    season: r.season,
    createdAt: r.created_at,
    recommendation: JSON.parse(r.generated_output),
  }));
  res.json({ history });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB initialization failed:", error);
    process.exit(1);
  });


const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { initDb, run, get, all } = require("./db");
const { buildRecommendation } = require("./recommendationEngine");

const app = express();

app.use(express.json());
app.use(
  session({
    secret: "styleai-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(express.static(__dirname));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

/* AUTH */

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) return res.json({ authenticated: false });
  const user = await get("SELECT id, name, email FROM users WHERE id = ?", [req.session.userId]);
  if (!user) return res.json({ authenticated: false });
  const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
  res.json({ authenticated: true, user, hasProfile: !!prefs });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    req.session.userId = result.lastID;
    res.json({ success: true, isNewUser: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user.id;
    const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]);
    res.json({ success: true, isNewUser: !prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

/* PREFERENCES */

app.post("/api/preferences", requireAuth, async (req, res) => {
  try {
    const { gender, bodyType, skinTone, height, stylePreference } = req.body;
    await run(
      `INSERT INTO user_preferences (user_id, gender, body_type, skin_tone, height, style_preference, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         gender=excluded.gender,
         body_type=excluded.body_type,
         skin_tone=excluded.skin_tone,
         height=excluded.height,
         style_preference=excluded.style_preference,
         updated_at=CURRENT_TIMESTAMP`,
      [req.session.userId, gender, bodyType, skinTone, height, stylePreference]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

app.get("/api/preferences", requireAuth, async (req, res) => {
  try {
    const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
    res.json({ prefs: prefs || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to load preferences" });
  }
});

/* RECOMMENDATIONS */

app.post("/api/recommendations", requireAuth, async (req, res) => {
  try {
    const { occasion } = req.body;
    const prefs = await get("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
    if (!prefs) return res.status(400).json({ error: "No profile found" });

    const input = {
      gender: prefs.gender,
      bodyType: prefs.body_type,
      skinTone: prefs.skin_tone,
      height: prefs.height,
      stylePreference: prefs.style_preference,
      occasion,
    };

    const recommendation = buildRecommendation(input);

    await run(
      "INSERT INTO recommendations (user_id, occasion, season, generated_output) VALUES (?, ?, ?, ?)",
      [req.session.userId, occasion, "current", JSON.stringify(recommendation)]
    );

    res.json({ success: true, recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});

app.get("/api/recommendations/history", requireAuth, async (req, res) => {
  try {
    const rows = await all(
      "SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
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
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

/* START */
initDb().then(() => {
  app.listen(3000, () => console.log("StyleAI server running on http://localhost:3000"));
});
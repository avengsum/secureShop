const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const db = require("../db");
const config = require("../config");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");

const router = Router();

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Apply rate limiting to auth routes
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.post("/register", authLimiter, validate(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ? OR username = ?")
    .get(email, username);

  if (existing) {
    return res.status(409).json({ error: "Username or email already taken" });
  }

  const hash = await bcrypt.hash(password, 10);

  const result = db
    .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
    .run(username, email, hash);

  res.status(201).json({
    id: result.lastInsertRowid,
    username,
    email,
  });
});

router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Logged in",
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});



module.exports = router;

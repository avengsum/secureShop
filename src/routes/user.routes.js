const { Router } = require("express");
const db = require("../db");
const authenticate = require("../middleware/auth");
const User = require("../models/user.model");

const router = Router();

// Get current user profile
router.get("/me", authenticate, (req, res) => {
  const user = User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;

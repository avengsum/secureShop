const { Router } = require("express");
const db = require("../db");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/rbac");

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

router.get("/users", (req, res) => {
  const users = db
    .prepare("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC")
    .all();
  
  res.json(users);
});

router.delete("/users/:id", (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }

  const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
});

module.exports = router;

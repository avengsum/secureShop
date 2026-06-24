const { Router } = require("express");
const Joi = require("joi");
const db = require("../db");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/rbac");
const validate = require("../middleware/validate");

const router = Router();

const productSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).allow("", null),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().max(50).default("general"),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().max(2000).allow("", null),
  price: Joi.number().positive().precision(2),
  stock: Joi.number().integer().min(0),
  category: Joi.string().max(50),
}).min(1);

router.get("/", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const products = db
    .prepare("SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset);

  const { total } = db.prepare("SELECT COUNT(*) as total FROM products").get();

  res.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:id", (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validate(productSchema),
  (req, res) => {
    const { name, description, price, stock, category } = req.body;

    const result = db
      .prepare(
        "INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)"
      )
      .run(name, description || null, price, stock, category);

    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(product);
  }
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validate(updateSchema),
  (req, res) => {
    const existing = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(req.body)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    const updated = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(req.params.id);

    res.json(updated);
  }
);

router.delete("/:id", authenticate, requireRole("admin"), (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ message: "Product deleted" });
});

module.exports = router;

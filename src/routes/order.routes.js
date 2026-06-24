const { Router } = require("express");
const Joi = require("joi");
const db = require("../db");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = Router();

const orderSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(100).required(),
});

router.use(authenticate);

router.get("/", (req, res) => {
  const orders = db
    .prepare(
      `SELECT o.*, p.name as product_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`
    )
    .all(req.user.id);

  res.json(orders);
});

router.get("/:id", (req, res) => {
  const order = db
    .prepare(
      `SELECT o.*, p.name as product_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.id = ?`
    )
    .get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(order);
});

router.post("/", validate(orderSchema), (req, res) => {
  const { product_id, quantity } = req.body;

  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(product_id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (product.stock < quantity) {
    return res
      .status(400)
      .json({ error: `Only ${product.stock} items in stock` });
  }

  const total_price = +(product.price * quantity).toFixed(2);

  const placeOrder = db.transaction(() => {
    const stockUpdate = db
      .prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?")
      .run(quantity, product_id, quantity);

    if (stockUpdate.changes === 0) {
      throw new Error("Stock unavailable");
    }

    const result = db
      .prepare(
        "INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)"
      )
      .run(req.user.id, product_id, quantity, total_price);

    return result.lastInsertRowid;
  });

  let orderId;
  try {
    orderId = placeOrder();
  } catch {
    return res.status(409).json({ error: "Could not place order, stock may have changed" });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  res.status(201).json(order);
});

module.exports = router;

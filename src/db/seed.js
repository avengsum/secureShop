const bcrypt = require("bcryptjs");
const db = require("./index");

async function seed() {
  console.log("Seeding database...");

  db.exec("DELETE FROM orders");
  db.exec("DELETE FROM products");
  db.exec("DELETE FROM users");

  const adminHash = await bcrypt.hash("admin1234", 10);
  const userHash = await bcrypt.hash("test1234", 10);

  db.prepare("INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)")
    .run(1, "admin", "admin@admin.com", adminHash, "admin");
    
  db.prepare("INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)")
    .run(2, "test", "test@test.com", userHash, "user");

  const insertProduct = db.prepare("INSERT INTO products (id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)");
  
  insertProduct.run(1, "Mechanical Keyboard", "Clicky switches, RGB backlighting", 129.99, 50, "electronics");
  insertProduct.run(2, "Wireless Mouse", "Ergonomic design, long battery life", 49.99, 100, "electronics");
  insertProduct.run(3, "Coffee Mug", "Keeps drinks hot for hours", 15.00, 200, "home");
  insertProduct.run(4, "Developer T-Shirt", "100% cotton, black", 25.00, 0, "apparel");
  
  const insertOrder = db.prepare("INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)");
  
  insertOrder.run(2, 1, 1, 129.99, "delivered");
  insertOrder.run(2, 3, 2, 30.00, "pending");

  console.log("Database seeded successfully!");
  console.log("Admin user: admin@admin.com / admin1234");
  console.log("Normal user: test@test.com / test1234");
}

seed().catch(console.error);

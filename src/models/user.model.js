const db = require("../db");

class User {
  static findByEmailOrUsername(email, username) {
    return db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username);
  }

  static findByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  static findById(id) {
    return db.prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?").get(id);
  }

  static create(username, email, hash) {
    const result = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").run(username, email, hash);
    return result.lastInsertRowid;
  }

  static findAll() {
    return db.prepare("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC").all();
  }

  static delete(id) {
    return db.prepare("DELETE FROM users WHERE id = ?").run(id);
  }
}

module.exports = User;

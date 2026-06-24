require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-do-not-use-in-prod",
  jwtExpiry: process.env.JWT_EXPIRY || "24h",
  dbPath: process.env.DB_PATH || "./data/secureshop.db",
  env: process.env.NODE_ENV || "development",
};

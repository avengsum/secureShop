// Simple in-memory rate limiter
const rateLimitStore = new Map();

function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100; // 100 requests per window

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;
    rateLimitStore.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  };
}

module.exports = rateLimiter;

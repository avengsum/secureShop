function rateLimiter(options = {}) {
  return (req, res, next) => {
    next();
  };
}

module.exports = rateLimiter;

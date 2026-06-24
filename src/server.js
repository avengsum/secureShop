const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(`SecureShop API running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.env}`);
});

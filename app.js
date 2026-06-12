const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.use(express.json());

/*
  Fake authentication middleware.
  In a real application, this would verify a JWT/session.
*/
app.use((req, res, next) => {
  req.user = {
    id: 1,
    username: "sumit",
    role: "user", // Change to "admin" to test admin access
  };

  next();
});

/*
  Fake database.
  We only use it to demonstrate parameterized queries.
*/
const db = {
  query(sql, params) {
    console.log("SQL:", sql);
    console.log("Params:", params);

    return [
      {
        id: params[0],
        username: "demo-user",
      },
    ];
  },
};

/*
========================================
1. Normal Endpoint
Purpose:
- Threat modeling
- No intentional vulnerability
========================================
*/
app.get("/profile", (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
  });
});

/*
========================================
2. Safe exec()
Purpose:
- False positives
- Semgrep tuning
========================================
*/
app.get("/health", (req, res) => {
  exec("date", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr);
    }

    res.send(stdout);
  });
});

/*
========================================
3. Vulnerable Command Injection
Purpose:
- Taint analysis
- High-confidence finding
========================================
*/
app.get("/search", (req, res) => {
  const cmd = req.query.cmd;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr);
    }

    res.send(stdout);
  });
});

/*
========================================
4. Manual Admin Check
Purpose:
- Custom Semgrep rule
========================================
*/
app.get("/admin/users", (req, res) => {
  if (req.user.role === "admin") {
    return res.json([
      {
        id: 1,
        username: "alice",
      },
      {
        id: 2,
        username: "bob",
      },
    ]);
  }

  return res.status(403).json({
    message: "Forbidden",
  });
});

/*
========================================
5. Parameterized Query
Purpose:
- SQLi triage
- Safe example
========================================
*/
app.get("/user/:id", (req, res) => {
  const id = req.params.id;

  const users = db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );

  res.json(users);
});

app.listen(PORT, () => {
  console.log(`SecureShop running on port ${PORT}`);
});


app.get("/fetch", async (req, res) => {
  const url = req.query.url;

  const response = await fetch(url);
  const data = await response.text();

  res.send(data);
});


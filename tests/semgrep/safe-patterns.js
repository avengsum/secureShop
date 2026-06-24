const { exec, execFile } = require("child_process");
const db = require("../../src/db");
const jwt = require("jsonwebtoken");

function safeExec() {
  // SAFE: Hardcoded string, not user input
  exec("date", (err, stdout) => console.log(stdout));
}

function safeExecFile(req) {
  // SAFE: execFile uses an argument array, preventing command injection
  execFile("ls", ["-l", req.query.dir], (err, stdout) => console.log(stdout));
}

function safeExecWithSanitizer(req) {
  // SAFE: User input is passed through parseInt(), making it safe from injection
  const id = parseInt(req.params.id);
  exec("get-user " + id, (err, stdout) => console.log(stdout));
}

function safeSqli(req) {
  // SAFE: Using parameterized queries (the '?' syntax)
  db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
}

function safeJwt() {
  // SAFE: Secret is pulled from environment variables, not hardcoded
  jwt.sign({ id: 1 }, process.env.JWT_SECRET);
}

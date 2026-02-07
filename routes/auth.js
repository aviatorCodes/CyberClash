const express = require("express");
const db = require("../db");
const router = express.Router();

// Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// ⚠️ INTENTIONALLY VULNERABLE LOGIN (CTF PURPOSES)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Reset riddle access on every login
  req.session.filesUnlocked = false;

  // Legacy authentication logic (DO NOT USE IN PRODUCTION)
  // TODO: Replace with prepared statements in future
  const query = `
    SELECT * FROM users
    WHERE username = '${username}'
    AND password = '${password}'
  `;

  console.log("DEBUG QUERY:", query);

  db.get(query, (err, user) => {
    if (err) {
      // Error leakage on purpose
      return res.send("Database error: " + err.message);
    }

    if (user) {
      req.session.user = user;
      return res.redirect("/dashboard");
    }

    res.render("login", {
      error: "Invalid username or password"
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;

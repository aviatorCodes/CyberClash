const express = require("express");
const db = require("../db");
const router = express.Router();

// Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Reset riddle access on every login
  req.session.filesUnlocked = false;

  // 1️⃣ SAFE: Check if username exists
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, existingUser) => {
      if (err) {
        return res.send("Database error: " + err.message);
      }

      if (!existingUser) {
        return res.render("login", {
          error: "Invalid username or password"
        });
      }

      // 2️⃣ INTENTIONALLY VULNERABLE (but scoped)
      const query = `
        SELECT * FROM users
        WHERE id = ${existingUser.id}
        AND password = '${password}'
      `;

      console.log("DEBUG QUERY:", query);

      db.get(query, (err, user) => {
        if (err) {
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
    }
  );
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;

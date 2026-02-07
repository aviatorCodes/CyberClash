const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", async (req, res) => {
  // basic auth check (matches your project style)
  if (!req.session || !req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  // OPTIONAL but recommended: admin-only access
  if (req.session.user.role !== "admin") {
    return res.status(403).send("Forbidden");
  }

  try {
    // correct path based on your folder tree
    const flagPath = path.join(
      __dirname,
      "..",
      "flags",
      "admin_flag.txt"
    );

    const flag = await fs.promises.readFile(flagPath, "utf8");

    res.render("admin", { flag });
  } catch (err) {
    console.error("Admin flag read error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
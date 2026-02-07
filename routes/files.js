const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const files = fs.readdirSync(uploadDir);
  res.render("files", { files });
});

router.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/files");
});

module.exports = router;

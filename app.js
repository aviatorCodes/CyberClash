const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");

require("./db");

const app = express();

/* =====================
   Body Parsing
===================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =====================
   Security
===================== */
app.use(helmet());

/* =====================
   Sessions
===================== */
app.use(
  session({
    name: "intracore.sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only if HTTPS
      sameSite: "lax"
    }
  })
);

/* =====================
   Static Files
===================== */
app.use(express.static(path.join(__dirname, "public")));

/* =====================
   View Engine
===================== */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =====================
   RIDDLE CONFIG
===================== */
const RIDDLE = {
  question: "What is your name?",
  password: "me",
  flag: "FLAG{kn0w_y0urs3lf}"
};

/* =====================
   Unlock Route (handles form submit)
===================== */
app.post("/unlock", (req, res) => {
  const password = req.body.password?.toLowerCase().trim();

  if (password === RIDDLE.password) {
    req.session.filesUnlocked = true;

    return res.send(`
      <h2 style="font-family:Arial;text-align:center;margin-top:50px">
        ✅ Correct!
      </h2>
      <p style="text-align:center">
        Flag: <b>${RIDDLE.flag}</b>
      </p>
      <p style="text-align:center">
        You can now access uploaded files.
      </p>
    `);
  }

  res.send(`
    <h2 style="font-family:Arial;text-align:center;margin-top:50px;color:red">
      ❌ Wrong Answer
    </h2>
    <p style="text-align:center">
      <a href="/files">Try again</a>
    </p>
  `);
});

/* =====================
   FILES ACCESS CONTROL
===================== */
function filesAccessControl(req, res, next) {
  // ✅ Everyone can upload files
  if (req.method === "POST") {
    return next();
  }

  // 👑 Admin always allowed
  if (req.session?.user?.role === "admin") {
    return next();
  }

  // 🔓 Riddle solved
  if (req.session?.filesUnlocked === true) {
    return next();
  }

  // ❌ Block & show riddle UI
  return res.status(403).send(`
<!DOCTYPE html>
<html>
<head>
  <title>Solve the Riddle</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #e5e7eb;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .box {
      background: #020617;
      padding: 30px;
      width: 360px;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0,0,0,0.6);
      text-align: center;
    }
    h2 {
      margin-bottom: 10px;
      color: #38bdf8;
    }
    .riddle {
      margin: 15px 0;
      font-style: italic;
    }
    input {
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      border-radius: 6px;
      border: none;
      outline: none;
    }
    button {
      margin-top: 15px;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: #38bdf8;
      color: #020617;
      font-weight: bold;
      cursor: pointer;
    }
    button:hover {
      background: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="box">
    <h2>Solve the Riddle 🧩</h2>
    <div class="riddle">
      ${RIDDLE.question}
    </div>

    <form method="POST" action="/unlock">
      <input
        type="password"
        name="password"
        placeholder="Enter your answer"
        required
      />
      <button type="submit">Unlock Files</button>
    </form>
  </div>
</body>
</html>
  `);
}

/* =====================
   Routes
===================== */
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/admin", require("./routes/admin"));
app.use("/files", filesAccessControl, require("./routes/files"));

/* =====================
   Root
===================== */
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

/* =====================
   Error Handler
===================== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error");
});

/* =====================
   Start Server
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IntraCore running on port ${PORT}`);
});
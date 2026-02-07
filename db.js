const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    INSERT OR REPLACE INTO users (id, username, password, role)
    VALUES (1, 'AdM1N', 'cyberclash', 'admin')
  `);

  db.run(`
    INSERT OR IGNORE INTO users (id, username, password, role)
    VALUES
      (2, 'guest1', 'guest12', 'user'),
      (3, 'guest2', 'guest23', 'user')
  `);
});

module.exports = db;

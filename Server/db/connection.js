const Database = require("better-sqlite3");

const db = new Database("Database/dnd.db");

db.pragma("foreign_keys = ON");

module.exports = db;
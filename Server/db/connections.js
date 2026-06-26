const Database = require("better-sqlite3");

const db = new Database("Database/dnd.db");

module.exports = db;
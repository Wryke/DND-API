const path = require("path")
const Database = require("better-sqlite3")

// Select the appropriate database based on the current environment
let databaseName
switch (process.env.NODE_ENV) {
    case "test":
        databaseName = "test.db"
        break

    case "development":
    default:
        databaseName = "dnd.db"
}

console.log(`Using database: ${databaseName}`)

// Open the SQLite database and enforce foreign key constraints
const db = new Database(
    path.join(__dirname, "../../Database", databaseName)
)

db.pragma("foreign_keys = ON")

module.exports = db
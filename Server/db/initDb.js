const fs = require("fs")
const path = require("path")
const Database = require("better-sqlite3")

// File paths used to recreate the database
const databasePath = path.join(
    __dirname,
    "../../Database/dnd.db"
)

const schemaPath = path.join(
    __dirname,
    "../../Database/schema.sql"
)

const referencePath = path.join(
    __dirname,
    "../../Database/referenceSeed.sql"
)

// Remove the previous database so each run starts fresh
if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath)
}

// Create a new SQLite database and enable foreign key enforcement
const db = new Database(databasePath)
db.pragma("foreign_keys = ON")

// Build the database schema
const schema = fs.readFileSync(schemaPath, "utf8")
db.exec(schema)

// Populate lookup/reference data
const reference = fs.readFileSync(referencePath, "utf8")
db.exec(reference)

// Close the database connection
db.close()

console.log("Database created successfully")
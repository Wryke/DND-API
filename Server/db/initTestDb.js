const fs = require("fs")
const path = require("path")
const Database = require("better-sqlite3")

// File paths used to recreate the test database
const databasePath = path.join(
    __dirname,
    "../../Database/test.db"
)

const schemaPath = path.join(
    __dirname,
    "../../Database/schema.sql"
)

const referencePath = path.join(
    __dirname,
    "../../Database/referenceSeed.sql"
)

const seedPath = path.join(
    __dirname,
    "../../Database/seed.sql"
)

// Remove the previous test database so each run starts fresh
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

// Populate item seed data
const seed = fs.readFileSync(seedPath, "utf8")
db.exec(seed)

// Close the database connection
db.close()

console.log("Test database created successfully")
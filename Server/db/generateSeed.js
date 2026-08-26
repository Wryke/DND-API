const fs = require("fs")
const path = require("path")
const Database = require("better-sqlite3")

// Read item data from the development database
const developmentDatabasePath = path.join(
    __dirname,
    "../../Database/dnd.db"
)

const seedPath = path.join(
    __dirname,
    "../../Database/seed.sql"
)

const db = new Database(
    developmentDatabasePath,
    {
        readonly: true
    }
)

// Read all seeded items from the development database
const items = db.prepare(`
    SELECT
        item_id,
        item_index,
        name,
        description,
        weight,
        cost_quantity,
        currency_unit_id,
        item_type_id
    FROM items
    ORDER BY item_id
`).all()

db.close()

// Safely convert a JavaScript value into a SQL literal
function toSqlValue(value) {
    if (value === null) {
        return "NULL"
    }

    if (typeof value === "number") {
        return String(value)
    }

    const escapedValue = String(value).replaceAll("'", "''")

    return `'${escapedValue}'`
}

// Build the static portion of seed.sql
const lines = [
    "-- Generated seed data",
    "-- Run npm run generate-seed to recreate this file",
    "",
    "INSERT INTO items (",
    "    item_id,",
    "    item_index,",
    "    name,",
    "    item_category",
    ")",
    "VALUES"
]

// Convert each item into an INSERT row
const itemRows = items.map((item, index) => {
    const suffix =
        index === items.length - 1
            ? ";"
            : ","

    return [
        "    (",
        `        ${toSqlValue(item.item_id)},`,
        `        ${toSqlValue(item.item_index)},`,
        `        ${toSqlValue(item.name)},`,
        `        ${toSqlValue(item.item_category)}`,
        `    )${suffix}`
    ].join("\n")
})

const seedSql = [
    ...lines,
    ...itemRows,
    ""
].join("\n")

fs.writeFileSync(
    seedPath,
    seedSql,
    "utf8"
)

console.log(
    `Generated seed.sql with ${items.length} items`
)
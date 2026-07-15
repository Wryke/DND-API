const fs = require("fs");
const path = require("path");
const db = require("./connection");

const equipmentPath = path.join(__dirname, "../../Database/Equipment.json");

// Read the source equipment data
const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"));

// Prepare an insert statement for the items table
const insertItem = db.prepare(`
    INSERT OR IGNORE INTO items (item_index, name, item_category)
    VALUES (?, ?, ?)
`);

// Seed one database row for each equipment item
for (const item of equipment) {
    const primaryCategory = item.equipment_categories?.[0]?.index ?? "unknown";

    insertItem.run(item.index, item.name, primaryCategory);
}

console.log("Items seeded.");
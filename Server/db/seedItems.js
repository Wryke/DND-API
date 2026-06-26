const fs = require("fs");
const path = require("path");
const db = require("./connection");

const equipmentPath = path.join(__dirname, "../../Database/Equipment.json");

const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"));

const insertItem = db.prepare(`
    INSERT OR IGNORE INTO items (item_index, name, item_category)
    VALUES (?, ?, ?)
`);

for (const item of equipment) {
    const primaryCategory = item.equipment_categories?.[0]?.index ?? "unknown";

    insertItem.run(item.index, item.name, primaryCategory);
}

console.log("Items seeded.");
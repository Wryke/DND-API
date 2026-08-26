const db = require("./connection")

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
`).all()

console.log(tables)

const itemTypes = db.prepare(`
    SELECT *
    FROM item_type_lookup
    ORDER BY item_type_id
`).all()

const currencies = db.prepare(`
    SELECT *
    FROM currency_lookup
    ORDER BY currency_unit_id
`).all()

console.log("Item Types:")
console.log(itemTypes)

console.log("Currencies:")
console.log(currencies)

const itemTypeCounts = db.prepare(`
    SELECT
        item_type_lookup.item_type_name,
        COUNT(*) AS item_count
    FROM items
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    GROUP BY item_type_lookup.item_type_name
    ORDER BY item_type_lookup.item_type_name
`).all()

console.log("Item Type Counts:")
console.log(itemTypeCounts)

// Spot-check a sample of items from each custom item type
const itemTypeSamples = db.prepare(`
    SELECT
        items.item_id,
        items.item_index,
        items.name,
        item_type_lookup.item_type_name
    FROM items
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    WHERE item_type_lookup.item_type_name IS ?
    LIMIT 5
`)

const typesToCheck = [
    "weapon",
    "armor",
    "container",
    "ammunition",
    "tool",
    "equipment_pack",
    null
]

console.log("Item Type Samples:")

for (const type of typesToCheck) {
    console.log(`\n${type ?? "NULL"}:`)
    console.log(itemTypeSamples.all(type))
}
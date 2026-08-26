const fs = require("fs")
const path = require("path")
const db = require("./connection")

const equipmentPath = path.join(__dirname, "../../Database/Equipment.json")

// Read the source equipment data
const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"))

// Containers do not have a consistent structural field in the source JSON
const containerIndexes = new Set([
    "backpack",
    "barrel",
    "basket",
    "bottle-glass",
    "bucket",
    "case-crossbow-bolt",
    "case-map-or-scroll",
    "chest",
    "component-pouch",
    "flask",
    "jug",
    "pot-iron",
    "pouch",
    "quiver",
    "sack",
    "vial",
    "waterskin"
])

// Prepare an insert statement for the items table
const insertItem = db.prepare(`
    INSERT OR IGNORE INTO items (
        item_index,
        name,
        description,
        weight,
        cost_quantity,
        currency_unit_id,
        item_type_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const findItemTypeByNameStmt = db.prepare(`
    SELECT
        item_type_id
    FROM item_type_lookup
    WHERE item_type_name = ?
`)

const findCurrencyByCodeStmt = db.prepare(`
    SELECT
        currency_unit_id
    FROM currency_lookup
    WHERE currency_code = ?
`)

// Determine which custom subtype table should store an item's details
function determineItemType(item) {
    const categoryIndexes = item.equipment_categories?.map(
        category => category.index
    ) ?? []

    if (item.damage) {
        return "weapon"
    }

    if (item.armor_class) {
        return "armor"
    }

    if (item.contents) {
        return "equipment_pack"
    }

    if (categoryIndexes.includes("ammunition")) {
        return "ammunition"
    }

    if (
        item.ability ||
        item.utilize ||
        item.craft ||
        categoryIndexes.includes("tools")
    ) {
        return "tool"
    }

    if (containerIndexes.has(item.index)) {
        return "container"
    }

    return null
}

// Seed one database row for each equipment item
for (const item of equipment) {
    const itemIndex = item.index
    const name = item.name
    const description = item.description ?? null
    const weight = item.weight ?? null
    const costQuantity = item.cost?.quantity ?? null

    const currency = item.cost
        ? findCurrencyByCodeStmt.get(item.cost.unit)
        : undefined

    const currencyUnitId =
        currency?.currency_unit_id ?? null

    const itemType = determineItemType(item)

    const itemTypeRow = itemType
        ? findItemTypeByNameStmt.get(itemType)
        : undefined

    const itemTypeId =
        itemTypeRow?.item_type_id ?? null

    insertItem.run(
        itemIndex,
        name,
        description,
        weight,
        costQuantity,
        currencyUnitId,
        itemTypeId
    )
}

console.log("Items seeded.")
const db = require("./connection")

// --- Item Queries ---

const findAllItemsStmt = db.prepare(`
    SELECT *
    FROM items
    ORDER BY name
`)

function findAllItems() {
    return findAllItemsStmt.all()
}

const findItemsByCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_category = ?
    ORDER BY name
`)

function findItemsByCategory(category) {
    return findItemsByCategoryStmt.all(category)
}

const findItemByIndexStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
`)

function findItemByIndex(itemIndex) {
    return findItemByIndexStmt.get(itemIndex)
}

const findItemByNameStmt = db.prepare(`
    SELECT *
    FROM items
    where name = ? COLLATE NOCASE
`)

// TODO: name is not unique in db schema
function findItemByName(name) {
    return findItemByNameStmt.get(name)
}

const findAllItemCategoriesStmt = db.prepare(`
    SELECT DISTINCT item_category
    FROM items
    ORDER BY item_category
`)

function findAllItemCategories() {
    return findAllItemCategoriesStmt.all().map(row => row.item_category)
}

const findItemByIndexAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
      AND item_category = ?
`)

function findItemByIndexAndCategory(itemIndex, category) {
    return findItemByIndexAndCategoryStmt.get(itemIndex, category)
}

const findItemByNameAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    where name = ? COLLATE NOCASE
      AND item_category = ?
`)

function findItemByNameAndCategory(name, category) {
    return findItemByNameAndCategoryStmt.get(name, category)
}

// --- Item Detail Queries ---

const findWeaponDetailsStmt = db.prepare(`
    SELECT *
    FROM weapons
    WHERE item_id = ?
`)

const findWeaponToMasteryStmt = db.prepare(`
    SELECT
        weapon_mastery_lookup.mastery_index,
        weapon_mastery_lookup.mastery_name
    FROM weapons
    JOIN weapon_mastery_lookup
        ON weapons.mastery_id = weapon_mastery_lookup.mastery_id
    WHERE weapon.item_id = ?
`)

//TODO: FINISH THIS FUNCTION
function findWeaponDetails(itemId) {
    const weapon = findWeaponDetailsStmt.get(itemId)

    if (!weapon) {
        return undefined
    }

    const mastery = findWeaponToMasteryStmt.all(itemId)

    return {
        ...weapon,
        mastery
    }
}

const findArmorDetailsStmt = db.prepare(`
    SELECT *
    FROM armor
    WHERE item_id = ?
`)

const findArmorResistancesStmt = db.prepare(`
    SELECT
        damage_type_lookup.damage_index,
        damage_type_lookup.damage_name
    FROM armor_to_resistance
    JOIN damage_type_lookup
        ON armor_to_resistance.damage_type_id =
            damage_type_lookup.damage_type_id
    WHERE armor_to_resistance.item_id = ?
`)

function findArmorDetails(itemId) {
    const armor = findArmorDetailsStmt.get(itemId)

    if (!armor) {
        return undefined
    }

    const resistances = findArmorResistancesStmt.all(itemId)

    return {
        ...armor,
        resistances
    }
}

const findContainerDetailsStmt = db.prepare(`
    SELECT *
    FROM containers
    WHERE item_id = ?
`)

function findContainerDetails(itemId) {
    return findContainerDetailsStmt.get(itemId)
}

const findAmmunitionDetailsStmt = db.prepare(`
    SELECT *
    FROM ammunition
    WHERE item_id = ?
`)

function findAmmunitionDetails(itemId) {
    return findAmmunitionDetailsStmt.get(itemId)
}

const findToolDetailsStmt = db.prepare(``)

function findToolDetails(itemId) {
    // TODO
    return findToolDetailsStmt.get(itemId)
}

const findEquipmentPackDetailsStmt = db.prepare(``)

function findEquipmentPackDetails(itemId) {
    // TODO
    return findEquipmentPackDetailsStmt.get(itemId)
}

module.exports = {
    findAllItems,
    findItemsByCategory,
    findItemByIndex,
    findItemByName,
    findAllItemCategories,
    findItemByIndexAndCategory,
    findItemByNameAndCategory
}
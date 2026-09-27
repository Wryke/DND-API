const {
    findItemByIndex,
    findItemEquipmentData
} = require("./itemQueries")

const backpack = findItemByIndex("backpack")

const equipmentData =
    findItemEquipmentData(backpack.item_id)

console.log(equipmentData)
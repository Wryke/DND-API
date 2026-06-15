const fs = require("fs")
const path = require("path")

const USERS = path.join(__dirname, "../../Database/Users.json")

function loadUsers() {
    const data = fs.readFileSync(USERS, "utf8")
    return JSON.parse(data)
}

function saveUsers(users) {
    fs.writeFileSync(USERS, JSON.stringify(users, null, 4))
}

function findUser(users, id) {
    return users.find(u => u.id === id)
}

function findCharacter(user, characterName) {
    return user.characters.find(c => c.character_name === characterName)
}

function findInventory(inventories, inventoryIndex) {
    return inventories.find(i => i.index === inventoryIndex)
}

function findItem(inventory, itemIndex){
    return inventory.items.find(i => i.index === itemIndex)
}

module.exports = {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter,
    findInventory,
    findItem
}
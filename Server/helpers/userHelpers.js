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
    return users.find(user => user.id === id)
}

function findCharacter(user, characterName) {
    return user.characters.find(character => character.character_name === characterName)
}

module.exports = {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter
}
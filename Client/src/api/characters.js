import { apiRequest } from "./apiHelpers"

async function getCharacters(userId) {
    const url = `http://localhost:3000/users/${userId}/characters`

    return apiRequest(url)
}

async function createCharacter(userId, newCharacter) {
    const url = `http://localhost:3000/users/${userId}/characters`

    const options = 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCharacter)
        }

    return apiRequest(url, options)
}

async function deleteCharacter(userId, characterName) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}`

    const options =
        {
            method: "DELETE"
        }

    return apiRequest(url, options)
}

export {
    getCharacters,
    createCharacter,
    deleteCharacter
}
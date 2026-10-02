import { apiRequest } from "./apiHelpers"

async function getCharacters() {
    const url = `/characters`

    return apiRequest(url)
}

async function createCharacter(newCharacter) {
    const url = `/characters`

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

async function deleteCharacter(characterName) {
    const url = `/characters/${encodeURIComponent(characterName)}`

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
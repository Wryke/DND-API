import { apiRequest } from "./apiHelpers"

async function getCharacterInventory(userId, characterName) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/inventory/all`

    return apiRequest(url)
}

async function addInventoryEntry(userId, characterName, newEntry) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/inventory`
    const options = 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newEntry)
        }

    return apiRequest(url, options)
}

async function updateInventoryEntry(userId, characterName, inventoryId, updatedEntry) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/inventory/${inventoryId}`

    const options =
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedEntry)
        }

    return apiRequest(url, options)
}

async function deleteInventoryEntry(userId, characterName, inventoryId) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/inventory/${inventoryId}`

    const options =
        {
            method: "DELETE"
        }

    return apiRequest(url, options)
}

export {
    getCharacterInventory,
    addInventoryEntry,
    updateInventoryEntry,
    deleteInventoryEntry
}
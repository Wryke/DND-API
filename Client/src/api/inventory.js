import { apiRequest } from "./apiHelpers"

async function getCharacterInventory(characterName) {
    const url = `/characters/${encodeURIComponent(characterName)}/inventory/all`

    return apiRequest(url)
}

async function addInventoryEntry(characterName, newEntry) {
    const url = `/characters/${encodeURIComponent(characterName)}/inventory`
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

async function updateInventoryEntry(characterName, inventoryId, updatedEntry) {
    const url = `/characters/${encodeURIComponent(characterName)}/inventory/${inventoryId}`

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

async function deleteInventoryEntry(characterName, inventoryId) {
    const url = `/characters/${encodeURIComponent(characterName)}/inventory/${inventoryId}`

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
import { apiRequest } from "./apiHelpers"

async function getCharacterEquipment(userId, characterName){
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment`

    return apiRequest(url)
}

async function createEquipmentEntry(userId, characterName, inventoryId, equipmentSlotId) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment`
    const options = 
    {
        method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(inventoryId, equipmentSlotId)
    }
    return apiRequest(url, options)
}

export {
    getCharacterEquipment,
    createEquipmentEntry
}
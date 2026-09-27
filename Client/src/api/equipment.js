import { apiRequest } from "./apiHelpers"

async function getEquipmentSlots() {
    const url = `http://localhost:3000/equipment/slots`

    return apiRequest(url)
}

async function getCompatibleInventory(userId, characterName, slotId) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment/compatible/${slotId}`

    return apiRequest(url)
}

async function getCharacterEquipment(userId, characterName){
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment`

    return apiRequest(url)
}

async function createEquipmentEntry(userId, characterName, inventoryId, equipmentSlotId) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment`
    
    const newEquipmentEntry = {
        inventory_id: inventoryId,
        equipment_slot_id: equipmentSlotId
    }

    const options = 
    {
        method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newEquipmentEntry)
    }

    return apiRequest(url, options)
}

async function deleteEquipmentEntry(userId, characterName, equipmentId) {
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment/${equipmentId}`

    const options = 
    {
        method: "DELETE"
    }

    return apiRequest(url, options)
}

export {
    getCharacterEquipment,
    getCompatibleInventory,
    createEquipmentEntry,
    getEquipmentSlots,
    deleteEquipmentEntry
}
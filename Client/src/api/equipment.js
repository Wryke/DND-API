import { apiRequest } from "./apiHelpers"

async function getEquipmentSlots() {
    const url = `http://localhost:3000/equipment/slots`

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

export {
    getCharacterEquipment,
    createEquipmentEntry,
    getEquipmentSlots
}
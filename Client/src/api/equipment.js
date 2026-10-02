import { apiRequest } from "./apiHelpers"

async function getEquipmentSlots() {
    const url = `/items/equipment-slots`

    return apiRequest(url)
}

async function getCompatibleInventory(characterName, slotId) {
    const url = `/characters/${encodeURIComponent(characterName)}/equipment/compatible/${slotId}`

    return apiRequest(url)
}

async function getCharacterEquipment(characterName){
    const url = `/characters/${encodeURIComponent(characterName)}/equipment`

    return apiRequest(url)
}

async function createEquipmentEntry(characterName, inventoryId, equipmentSlotId) {
    const url = `/characters/${encodeURIComponent(characterName)}/equipment`
    
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

async function deleteEquipmentEntry(characterName, equipmentId) {
    const url = `/characters/${encodeURIComponent(characterName)}/equipment/${equipmentId}`

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
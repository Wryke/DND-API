import { apiRequest } from "./apiHelpers"

async function getCharacterEquipment(userId, characterName){
    const url = `http://localhost:3000/users/${userId}/characters/${encodeURIComponent(characterName)}/equipment`

    return apiRequest(url)
}

export {
    getCharacterEquipment
}
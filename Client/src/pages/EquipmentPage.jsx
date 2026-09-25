import { useEffect, useState } from 'react'

import CharacterHeader from '../components/CharacterHeader'
import EquipmentInfo from '../components/EquipmentInfo'
import Modal from "../components/Modal"
import EquipItemForm from "../components/EquipItemForm"

import { 
    createEquipmentEntry, 
    deleteEquipmentEntry
} from "../api/equipment"

function EquipmentPage(props) {
    
    // --- State ---
    const [selectedSlot, setSelectedSlot] = useState(null)

    // --- Derived Data ---
    const equippedItems = props.equipmentSlots.map((slot) => {
        const equippedItem = props.equipment.find(
            entry => entry.equipment_slot_id === slot.equipment_slot_id
        )

        return (
            <EquipmentInfo
                key={slot.equipment_slot_id}
                slot={slot}
                equippedItem={equippedItem}
                selectSlot={setSelectedSlot}
                onUnequip={handleUnequipItem}
            />
        )
    })

    // --- Event Handlers ---
    function handleCloseEquipForm (){
        setSelectedSlot(null)
    }

    async function handleEquipItem(inventoryId, equipmentSlotId) {
        try {
            const data = await createEquipmentEntry(
                1,
                props.selectedCharacter.name,
                inventoryId,
                equipmentSlotId
            )

            props.onEquipmentAdded(data)
            setSelectedSlot(null)

            return null
        }
        catch (error) {
            console.error(error)
            return error.message
        }
    }

    async function handleUnequipItem(equipmentId) {
        try {
            await deleteEquipmentEntry(
                1,
                props.selectedCharacter.name,
                equipmentId
            )

            props.onEquipmentRemoved(equipmentId)
            setSelectedSlot(null)
        }
        catch (error) {
            console.error(error)
        }
    }

    // --- Render ---
    return (
        <div>
            <h1>Equipment</h1>

            {props.selectedCharacter && (
                <div>
                    <CharacterHeader 
                        character={props.selectedCharacter}
                        currentWeight={props.currentWeight}
                        inventoryValue={props.inventoryValue}
                    />

                    {selectedSlot && (
                        <p>Selected: {selectedSlot.equipment_slot_name}</p>
                    )}

                    {equippedItems}

                    {selectedSlot && (
                        <Modal>
                            <EquipItemForm
                                slot={selectedSlot}
                                inventory={props.inventory}
                                onCancel={handleCloseEquipForm}
                                onEquip={handleEquipItem}
                            />
                        </Modal>
                    )}
                </div>
            )}
        </div>
    )
}

export default EquipmentPage
import { useEffect, useState } from 'react'
import CharacterHeader from '../components/CharacterHeader'
import EquipmentInfo from '../components/equipmentInfo'

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
            />
        )
    })

    // --- Event Handlers ---

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
                </div>
            )}
        </div>
    )
}

export default EquipmentPage
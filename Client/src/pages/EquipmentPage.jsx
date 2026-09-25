import CharacterHeader from '../components/CharacterHeader'

function EquipmentPage(props) {
    
    // --- State ---

    // --- Derived Data ---

    const equipmentSlots = [
        "head",
        "armor",
        "hands",
        "feet",
        "accessory_1",
        "accessory_2",
        "accessory_3",
        "accessory_4",
        "accessory_5",
        "main_hand",
        "off_hand"
    ]

    const equippedItem = props.equipment.find(
        entry => entry.equipment_slot_name === "main_hand"
    )
    
    const equippedItems = equipmentSlots.map((slot) => {
        const equippedItem = props.equipment.find(
            entry => entry.equipment_slot_name === slot
        )

        return (
            <div key={slot}>
                {equippedItem && (
                    <p >
                        {slot} | {equippedItem ? equippedItem.name : "empty"}
                    </p>
                )}
            </div>
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

                    {equippedItems}
                </div>
            )}
        </div>
    )
}

export default EquipmentPage
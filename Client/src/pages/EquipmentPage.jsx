import CharacterHeader from '../components/CharacterHeader'

function EquipmentPage(props) {
    
    // --- State ---

    // --- Derived Data ---

    const equipmentElements = props.equipment.map((equipmentEntry) => {
        return (
            <p key={equipmentEntry.equipment_id}>
                {equipmentEntry.equipment_slot_name}: {equipmentEntry.name}
            </p>
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

                    {equipmentElements}
                </div>
            )}
        </div>
    )
}

export default EquipmentPage

function EquipmentInfo(props) {
    
    return (
        <div>
            <h2>
                {props.slot.equipment_slot_name} | {props.equippedItem ? props.equippedItem.name : "empty"}
            </h2>

            {props.equippedItem ? (
                <button
                    onClick={() => props.onUnequip(props.equippedItem.equipment_id)}
                >
                    Unequip
                </button>
            ) : (
                <button
                    onClick={() => props.selectSlot(props.slot)}
                >
                    Equip
                </button>
            )}
        </div>
    )
}

export default EquipmentInfo
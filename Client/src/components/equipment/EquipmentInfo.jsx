
function EquipmentInfo(props) {
    
    return (
        <div className="equipment-slot">
            <h2>
                {props.slot.equipment_slot_name}
            </h2>
            <h3 className={props.equippedItem ? "equipped-item" : "empty-slot"}>
                {props.equippedItem ? props.equippedItem.name : "Empty"}
            </h3>

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
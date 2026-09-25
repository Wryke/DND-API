
function EquipmentInfo(props) {
    return (
        <div>
            <h2>
                {props.slot.equipment_slot_name} | {props.equippedItem ? props.equippedItem.name : "empty"}
            </h2>

            <button onClick={() => props.selectSlot(props.slot)}>
                Select
            </button>
        </div>
    )
}

export default EquipmentInfo
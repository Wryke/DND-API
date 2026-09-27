import { useEffect, useState } from "react"

import { 
    getCompatibleInventory
} from "../api/equipment"

function EquipItemForm (props) {
    
    // --- State ---
    const [error, setError] = useState("")

    const [selectedInventoryId, setSelectedInventoryId] = useState("")

    const [compatibleInventory, setCompatibleInventory] = useState([])

    // --- Derived Data ---
    const inventoryOptions = compatibleInventory.map((item) => {
        return (
            <option
                key={item.inventory_id}
                value={item.inventory_id}
            >
                {item.name}
            </option>
        )
    })

    // --- Use Effects ---
    useEffect(() => {
        async function loadCompatibleInventory() {
            try {
                const data = await getCompatibleInventory(
                    1,
                    props.selectedCharacter.name,
                    props.slot.equipment_slot_id
                )

                setCompatibleInventory(data)
            }
            catch (error) {
                console.error(error)
            }
        }

        loadCompatibleInventory()
    }, [props.slot.equipment_slot_id])

    // --- Event Handlers ---
    async function handleSubmit(event) {
        event.preventDefault()

        setError("")

        if (selectedInventoryId === "") {
            setError("Please select an item.")
            return
        }

        const errorMessage = await props.onEquip(
            Number(selectedInventoryId),
            props.slot.equipment_slot_id
        )

        if (errorMessage) {
            setError(errorMessage)
        }
    }

    // --- Render ---
    return (
        <form onSubmit={handleSubmit}>
            <h2>Equip Item</h2>

            <p>Equipment Slot: {props.slot.equipment_slot_name}</p>

            <label>
                Item
            </label>

            <select
                value={selectedInventoryId}
                onChange={(event) => {
                    setSelectedInventoryId(event.target.value)
                }}
            >
                <option value="">
                    No Selection
                </option>

                {inventoryOptions}
            </select>

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <button type="submit">
                Equip
            </button>

            <button
                type="button"
                onClick={props.onCancel}
            >
                Cancel
            </button>
        </form>
    )
}

export default EquipItemForm
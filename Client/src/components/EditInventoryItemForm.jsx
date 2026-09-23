import { useState } from 'react'
import { getContainerPath, getDescendantIds } from '../utils/inventory'

function EditInventoryItemForm(props) {

    // --- State ---
    const [error, setError] = useState("")

    const [quantity, setQuantity] = useState(props.item.quantity)

    const [parentInventoryId, setParentInventoryId] = useState(
        props.item.parent_inventory_id === null
            ? ""
            : String(props.item.parent_inventory_id)
    )

    // --- Derived Data ---
    const descendantIds = getDescendantIds(
        props.item.inventory_id,
        props.inventory
    )

    const containers = props.inventory.filter((item) => {
        return (
            item.item_type_name === "container" &&
            item.inventory_id !== props.item.inventory_id &&
            !descendantIds.has(item.inventory_id)
        )
    })

    const containerOptions = containers.map((container) => {
        return (
            <option
                key={container.inventory_id}
                value={container.inventory_id}
            >
                {getContainerPath(container, props.inventory)}
            </option>
        )
    })

    // --- Event Handlers ---
    async function handleSubmit(event) {
        event.preventDefault()

        setError("")

        const numericQuantity = Number(quantity)

        const parentId = parentInventoryId === ""
            ? null
            : Number(parentInventoryId)

        const errorMessage = await props.updateInventoryItem(
            props.item.inventory_id,
            numericQuantity,
            parentId
        )

        if (errorMessage) {
            setError(errorMessage)
            return
        }

        props.onItemUpdated()
    }

    // --- Render ---
    return (
        <form
            className="add-item-form"
            onSubmit={handleSubmit}
        >
            <div className="form-field">
                <label htmlFor={`edit-quantity-${props.item.inventory_id}`}>
                    Quantity
                </label>

                <input
                    id={`edit-quantity-${props.item.inventory_id}`}
                    type="number"
                    value={quantity}
                    onChange={(event) => {
                        setQuantity(event.target.value)
                    }}
                />
            </div>

            <div className="form-field">
                <label htmlFor={`edit-parent-${props.item.inventory_id}`}>
                    Store Inside
                </label>

                <select
                    id={`edit-parent-${props.item.inventory_id}`}
                    value={parentInventoryId}
                    onChange={(event) => {
                        setParentInventoryId(event.target.value)
                    }}
                >
                    <option value="">
                        Root Inventory
                    </option>

                    {containerOptions}
                </select>
            </div>

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <button type="submit">
                Save Changes
            </button>
        </form>
    )
}

export default EditInventoryItemForm
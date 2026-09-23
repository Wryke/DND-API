import { useState } from 'react'

function EditInventoryItemForm(props) {

    const [quantity, setQuantity] = useState(
        props.item.quantity
    )

    const containers = props.inventory.filter((item) => {
        return (
            item.item_type_name === "container" &&
            item.inventory_id !== props.item.inventory_id
        )
    })

    const [parentInventoryId, setParentInventoryId] = useState(
        props.item.parent_inventory_id === null
            ? ""
            : String(props.item.parent_inventory_id)
    )

    const containerElements = containers.map((container) => {
        return (
            <option
                key={container.inventory_id}
                value={container.inventory_id}
            >
                {container.name}
            </option>
        )
    })
    
    async function handleSubmit(event) {
        event.preventDefault()

        const numericQuantity = Number(quantity)

        const parentId = parentInventoryId === ""
            ? null
            : Number(parentInventoryId)

        const error = await props.updateInventoryItem(
            props.item.inventory_id,
            numericQuantity,
            parentId
        )

        if (error) {
            console.error(error)
            return
        }
    }

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

                        {containerElements}
                    </select>
                </div>

                <button type="submit">
                    Save Changes
                </button>
            </div>
        </form>
    )
}

export default EditInventoryItemForm
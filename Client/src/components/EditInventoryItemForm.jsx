import { useState } from 'react'

function EditInventoryItemForm(props) {

    const [error, setError] = useState("")

    const [quantity, setQuantity] = useState(
        props.item.quantity
    )

    function getDescendantIds(inventoryId, inventory) {
        const descendantIds = new Set()

        function findChildren(parentId) {
            const children = inventory.filter((item) => {
                return item.parent_inventory_id === parentId
            })

            children.forEach((child) => {
                descendantIds.add(child.inventory_id)
                findChildren(child.inventory_id)
            })
        }

        findChildren(inventoryId)

        return descendantIds
    }

    const descendantIds = getDescendantIds(
        props.item.inventory_id,
        props.inventory
    )

    function getContainerPath(container, inventory) {
        if (container.parent_inventory_id === null) {
            return container.name
        }

        const parent = inventory.find((item) => {
            return item.inventory_id === container.parent_inventory_id
        })

        if (!parent) {
            return container.name
        }

        return getContainerPath(parent, inventory) + " > " + container.name
    }

    const containers = props.inventory.filter((item) => {
        return (
            item.item_type_name === "container" &&
            item.inventory_id !== props.item.inventory_id &&
            !descendantIds.has(item.inventory_id)
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
                {getContainerPath(container, props.inventory)}
            </option>
        )
    })

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

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                <button type="submit">
                    Save Changes
                </button>
            </div>
        </form>
    )
}

export default EditInventoryItemForm
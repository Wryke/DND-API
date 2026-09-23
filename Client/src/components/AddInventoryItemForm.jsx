import { useEffect, useState } from 'react'

function getContainerPath(container, inventory) {
    if (container.parent_inventory_id === null) {
        return container.name
    }

    const parent = inventory.find((item) => {
        return item.inventory_id === container.parent_inventory_id
    })

    return getContainerPath(parent, inventory) + " > " + container.name
}

function AddInventoryItemForm(props) {
    const [error, setError] = useState("")
    const [itemIndex, setItemIndex] = useState("")
    const [quantity, setQuantity] = useState("")
    const [items, setItems] = useState([])
    const [parentInventoryId, setParentInventoryId] = useState("")

    const containers = props.inventory.filter((item) => {
        return item.item_type_name === "container"
    })

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

    useEffect(() => {
        async function loadItems() {
            const response = await fetch("http://localhost:3000/items")
            const data = await response.json()

            setItems(data)
        }

        loadItems()
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()

        const parentId = parentInventoryId === ""
            ? null
            : Number(parentInventoryId)
            
        const error = await props.addInventoryItem(
            itemIndex,
            Number(quantity),
            parentId
        )

        if(error !== null){
            setError(error)
            return
        }

        props.onItemAdded()
        setError("")
        setItemIndex("")
        setQuantity("")
        setParentInventoryId("")
    }

    const itemElement = items.map((item) => {
        return (
            <option
                key={item.item_id}
                value={item.item_index}
            >
                {item.name} | {item.weight} lbs | {item.cost_quantity} {item.currency_code}
            </option>
        )
    })

    return (
        <form className="add-item-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="item">Item</label>

                <select
                    id="item"
                    value={itemIndex}
                    onChange={(event) => {
                        setItemIndex(event.target.value)
                    }}
                >
                    <option value="">
                        Select an item
                    </option>
                    {itemElement}
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="quantity">Quantity</label>

                <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(event) => {
                        setQuantity(event.target.value)
                    }}
                />
            </div>

            <div className="form-field">
                <label htmlFor="parentInventory">
                    Store Inside
                </label>

                <select
                    id="parentInventory"
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
            
            {error && <p>{error}</p>}

            <button type="submit">
                Add Item
            </button>
        </form>
    )
}

export default AddInventoryItemForm
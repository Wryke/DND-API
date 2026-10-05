import { useEffect, useState } from 'react'
import { getContainerPath } from '../utils/inventory'
import { getItems } from "../api/items"

function AddInventoryItemForm(props) {

    // --- State ---
    const [error, setError] = useState("")

    const [isLoading, setIsLoading] = useState(true)

    const [items, setItems] = useState([])

    const [itemIndex, setItemIndex] = useState("")

    const [quantity, setQuantity] = useState("")

    const [parentInventoryId, setParentInventoryId] = useState("")

    // --- Effects ---
    useEffect(() => {
        async function loadItems() {
            try {
                setIsLoading(true)

                const data = await getItems()

                setItems(data)
            }
            catch (error) {
                console.error(error)
                setError(error.message)
            }
            finally {
                setIsLoading(false)
            }
        }

        loadItems()
    }, [])

    // --- Derived Data ---
    const containers = props.inventory.filter((item) => {
        return item.item_type_name === "container"
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

    const itemOptions = items.map((item) => {
        return (
            <option
                key={item.item_id}
                value={item.item_index}
            >
                {item.name} | {item.weight} lbs | {item.cost_quantity} {item.currency_code}
            </option>
        )
    })

    // --- Event handlers ---
    async function handleSubmit(event) {
        event.preventDefault()

        const parentId = parentInventoryId === ""
            ? null
            : Number(parentInventoryId)
            
        const errorMessage = await props.addInventoryItem(
            itemIndex,
            Number(quantity),
            parentId
        )

        if(errorMessage !== null){
            setError(errorMessage)
            return
        }

        props.onItemAdded()
        setError("")
        setItemIndex("")
        setQuantity("")
        setParentInventoryId("")
    }

    // --- Render ---
    return (
        <form className="add-item-form" onSubmit={handleSubmit}>

            <div className="form-field">

                <label htmlFor="item">Item</label>

                <select
                    id="item"
                    value={itemIndex}
                    disabled={isLoading || items.length === 0}
                    onChange={(event) => {
                        setItemIndex(event.target.value)
                    }}
                >
                    <option value="">
                    {isLoading
                        ? "Loading Items..."
                        : items.length === 0
                            ? "Items Failed to Load"
                            : "No Selection"
                    }
                </option>
                    {itemOptions}
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

                    {containerOptions}
                </select>
            </div>
            
            {error && <p>{error}</p>}

            <button 
                type="submit"
                disabled={isLoading || items.length === 0}
            >
                Add Item
            </button>
        </form>
    )
}

export default AddInventoryItemForm
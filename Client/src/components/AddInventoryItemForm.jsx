import { useEffect, useState } from 'react'

function AddInventoryItemForm(props) {
    const [error, setError] = useState("")
    const [itemIndex, setItemIndex] = useState("")
    const [quantity, setQuantity] = useState("")
    const [items, setItems] = useState([])

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

        const result = await props.addInventoryItem(
            itemIndex,
            Number(quantity)
        )

        if(result !== null){
            setError(result)
            return
        }

        setError("")
        setItemIndex("")
        setQuantity("")
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
        <form onSubmit={handleSubmit}>
            <h3>Add Item</h3>
            <select
                value={itemIndex}
                onChange={(event) => setItemIndex(event.target.value)}
            >
                <option value="">Select an item</option>

                {itemElement}
            </select>
            <label>
                Item Quantity:
                <input
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                />
            </label>

            {error && <p>{error}</p>}
            
            <button type="submit">
                Add Item
            </button>
        </form>
    )
}

export default AddInventoryItemForm
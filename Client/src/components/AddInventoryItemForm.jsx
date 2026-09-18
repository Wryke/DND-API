import { useState } from 'react'

function AddInventoryItemForm() {
    const [error, setError] = useState("")

    const [itemIndex, setItemIndex] = useState("")
    const [quantity, setQuantity] = useState("")

    function handleSubmit(event) {
        event.preventDefault()

        console.log(itemIndex)
        console.log(quantity)
    }

    return (
        <form>
            <h3>Add Item</h3>
            <label>
                Item Index:
                <input
                    type="text"
                    value={itemIndex}
                    onChange={(event) => setItemIndex(event.target.value)}
                />
            </label>

            <label>
                Item Quantity:
                <input
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                />
            </label>

            <p>Current item: {itemIndex}</p>
            <p>Current quantity: {quantity}</p>

            {error && <p>{error}</p>}
            
            <button type="submit">
                Add Item
            </button>
        </form>
    )
}

export default AddInventoryItemForm
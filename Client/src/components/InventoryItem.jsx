import { useState } from 'react'

function InventoryItem(props) {
    return (
        <div>
            <h3>{props.item.name}</h3>
            <p>Quantity: {props.item.quantity}</p>
            <p>Weight: {props.item.weight}</p>
            <p>Type: {props.item.item_type_name}</p>
        </div>
    )
}

export default InventoryItem
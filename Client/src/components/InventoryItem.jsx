import { useState } from 'react'

function InventoryItem(props) {
    const [children, setChildren] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

    async function loadChildren() {
        const response = await fetch(
            `http://localhost:3000/users/${props.userId}/characters/${encodeURIComponent(props.characterName)}/inventory/${props.item.inventory_id}/children`
        )

        const data = await response.json()

        setChildren(data)
    }

    function handleContainerClick() {
        // What should happen when the container is closed?
        if(!isOpen && children === null){
            loadChildren()
        } 
        // What should happen when the container is open?
        setIsOpen(!isOpen)
    }
    return (
        <div>
            <p>{props.item.name} | Quantity: {props.item.quantity}, Weight: {props.item.weight},
                 Type: {props.item.item_type_name === null ? "generic" : props.item.item_type_name}</p>
            
            {props.item.item_type_name === "container" && (
                <button onClick = {handleContainerClick}>
                    {isOpen ? "Hide Contents" : "View Contents"}
                </button>
            )}

            {isOpen && children && (
                children.map((child) => {
                    return (
                        <InventoryItem
                            key={child.inventory_id}
                            item={child}
                            userId={props.userId}
                            characterName={props.characterName}
                        />
                    )
                })
            )}

            {isOpen && children !== null && children.length === 0 && (<p>-- Empty --</p>)}
        </div>
    )
}

export default InventoryItem
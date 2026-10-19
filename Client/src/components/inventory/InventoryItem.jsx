import { useState } from 'react'
import { convertToGold } from '../../utils/currency'

import EditInventoryItemForm from './EditInventoryItemForm'
import Modal from '../Modal'

function InventoryItem(props) {

    // --- State ---
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // --- Derived Data ---
    const children = props.inventory.filter((item) => {
        return item.parent_inventory_id === props.item.inventory_id
    })

    const visibleChildren = children.filter((child) => {
        return (
            !props.isFiltering ||
            props.visibleInventoryIds.has(child.inventory_id)
        )
    })

    const shouldShowChildren = isOpen || props.isFiltering

    const cumulativeWeight = props.item.weight * props.item.quantity

    const unitGoldValue = convertToGold(
        props.item.cost_quantity,
        props.item.currency_code
    )

    const totalGoldValue = unitGoldValue * props.item.quantity

    // --- Event Handlers ---
    function handleExpandClick() {
        setIsOpen(!isOpen)
    }

    function handleEditClose() {
        setIsEditOpen(false)
    }

    function handleEditClick() {
        setIsEditOpen(true)
    }

    async function handleRemoveClick() {
        const errorMessage = await props.removeInventoryItem(
            props.item.inventory_id
        )

        if (errorMessage) {
            console.error(errorMessage)
        }
    }

    // --- Render ---
    return (
        <div>
            <div className="inventory-row">
                <span
                    className="inventory-item-name"
                    style={{
                        paddingLeft: `${props.depth * 1.5}rem`
                    }}
                >
                    {props.item.item_type_name === "container" ? (
                        <button
                            className="inventory-expand-button"
                            onClick={handleExpandClick}
                        >
                            {isOpen ? "−" : "+"}
                        </button>
                    ) : (
                        <span className="inventory-expand-placeholder"></span>
                    )}

                    {props.item.name}
                </span>

                <span>{props.item.quantity}</span>
                <span>{props.item.weight} lbs</span>
                <span>{cumulativeWeight} lbs</span>
                <span>{unitGoldValue} gp</span>
                <span>{totalGoldValue} gp</span>

                <button onClick={handleEditClick}>
                    Edit
                </button>

                <button onClick={handleRemoveClick}>
                    Remove
                </button>
            </div>

            {shouldShowChildren && 
                visibleChildren.map((child) => {
                    return (
                        <InventoryItem
                            key={child.inventory_id}
                            item={child}
                            inventory={props.inventory}
                            visibleInventoryIds={props.visibleInventoryIds}
                            isFiltering={props.isFiltering}
                            removeInventoryItem={props.removeInventoryItem}
                            updateInventoryItem={props.updateInventoryItem}
                            depth={props.depth + 1}
                        />
                    )
                })
            }

            {isEditOpen && (
                <Modal>
                    <h2>Edit {props.item.name}</h2>

                    <EditInventoryItemForm
                        item={props.item}
                        inventory={props.inventory}
                        updateInventoryItem={props.updateInventoryItem}
                        onItemUpdated={handleEditClose}
                    />

                    <button onClick={handleEditClose}>
                        Cancel
                    </button>
                </Modal>
            )}

            {shouldShowChildren && 
                props.item.item_type_name === "container" && 
                visibleChildren.length === 0 && (
                    <p>-- Empty --</p>
            )}
        </div>
    )
}

export default InventoryItem
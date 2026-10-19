import { useState } from 'react'

import AddInventoryItemForm from '../components/inventory/AddInventoryItemForm'
import CharacterHeader from '../components/characters/CharacterHeader'
import InventoryItem from '../components/inventory/InventoryItem'
import Modal from '../components/Modal'

import { addItemAndParents } from '../utils/inventory'

function InventoryPage(props) {

    // --- State ---
    const [searchText, setSearchText] = useState("")
    const [selectedType, setSelectedType] = useState("all")
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)

    // --- Derived Data ---

    // Item type filter options
    const itemTypes = new Set()

    props.inventory.forEach((item) => {
        if (item.item_type_name === null) {
            itemTypes.add("generic")
        }
        else {
            itemTypes.add(item.item_type_name)
        }
    })

    const typeOptions = Array.from(itemTypes).map((type) => {
        return (
            <option
                key={type}
                value={type}
            >
                {type}
            </option>
        )
    })

    // Search/filter calculations
    const normalizedSearchText = searchText.trim().toLowerCase()

    const isFiltering =
        normalizedSearchText !== "" ||
        selectedType !== "all"

    const matchingInventory = props.inventory.filter((item) => {
        const matchesSearch = item.name
            .toLowerCase()
            .includes(normalizedSearchText)

        const matchesType =
            selectedType === "all" ||
            item.item_type_name === selectedType ||
            (selectedType === "generic" && item.item_type_name === null)

        return matchesSearch && matchesType
    })

    // Hierarchy
    const rootInventory = props.inventory.filter((item) => {
        return item.parent_inventory_id === null
    })

    const visibleInventoryIds = new Set()

    matchingInventory.forEach((item) => {
        addItemAndParents(
            item,
            props.inventory,
            visibleInventoryIds
        )
    })

    const visibleRootInventory = rootInventory.filter((item) => {
        return (
            !isFiltering ||
            visibleInventoryIds.has(item.inventory_id)
        )
    })

    // --- Event Handlers ---
    function handleAddItemOpen() {
        setIsAddItemOpen(true)
    }

    function handleAddItemClose() {
        setIsAddItemOpen(false)
    }

    // --- Render ---
    const inventoryElements = visibleRootInventory.map((item) => {
        return (
            <InventoryItem
                key={item.inventory_id}
                item={item}
                inventory={props.inventory}
                visibleInventoryIds={visibleInventoryIds}
                isFiltering={isFiltering}
                removeInventoryItem={props.removeInventoryItem}
                updateInventoryItem={props.updateInventoryItem}
                depth={0}
            />
        )
    })

    return (
        <div>

            <h1>Inventory</h1>

            {props.selectedCharacter && (
                <div>
                    <CharacterHeader 
                        character={props.selectedCharacter}
                        currentWeight={props.currentWeight}
                        inventoryValue={props.inventoryValue}
                    />

                    <div className="inventory-toolbar">

                        <button
                            onClick={handleAddItemOpen}
                        >
                            Add Item
                        </button>

                        <input
                            className="inventory-search"
                            type="text"
                            placeholder="Search inventory..."
                            value={searchText}
                            onChange={(event) => {setSearchText(event.target.value)}}
                        />

                        <select
                            value={selectedType}
                            onChange={(event) => {
                                setSelectedType(event.target.value)
                            }}
                        >
                            <option value="all">
                                All Types
                            </option>

                            {typeOptions}

                        </select>
                    </div>

                    <div className="inventory-table-header">
                        <span>Item Name</span>
                        <span>Quantity</span>
                        <span>Unit Weight</span>
                        <span>Total Weight</span>
                        <span>Unit Value</span>
                        <span>Total Value</span>
                    </div>

                    {inventoryElements}

                    {isAddItemOpen && (
                        <Modal>
                            <h2>Add Item</h2>

                            <AddInventoryItemForm
                                addInventoryItem={props.addInventoryItem}
                                inventory={props.inventory}
                                onItemAdded={handleAddItemClose}
                            />

                            <button onClick={handleAddItemClose}>
                                Cancel
                            </button>
                        </Modal>
                    )}
                </div>
            )}
        </div>
    )
}

export default InventoryPage
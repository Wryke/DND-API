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

function addItemAndParents(item, inventory, visibleInventoryIds) {
    visibleInventoryIds.add(item.inventory_id)

    if (item.parent_inventory_id === null) {
        return
    }

    const parent = inventory.find((inventoryItem) => {
        return inventoryItem.inventory_id === item.parent_inventory_id
    })

    if (parent) {
        addItemAndParents(parent, inventory, visibleInventoryIds)
    }
}

export { getContainerPath, getDescendantIds, addItemAndParents }
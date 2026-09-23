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

export { getContainerPath }
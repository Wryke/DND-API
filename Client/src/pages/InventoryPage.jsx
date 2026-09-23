import AddInventoryItemForm from '../components/AddInventoryItemForm'

function InventoryPage(props) {
    return (
        <div>
            <h1>Inventory</h1>
                {props.selectedCharacter && (
                    <div>
                        <h2>_______________________________________________________</h2>
                        <h2>Selected Character: {props.selectedCharacter.name} | {props.selectedCharacter.max_weight} lbs</h2>
                        <h2>_______________________________________________________</h2>
                        <AddInventoryItemForm addInventoryItem={props.addInventoryItem} />
                        {props.inventoryElements}
                    </div>
                )}
        </div>
    )
}

export default InventoryPage
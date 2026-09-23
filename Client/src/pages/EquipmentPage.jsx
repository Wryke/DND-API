import CharacterHeader from '../components/CharacterHeader'

function EquipmentPage(props) {
    return (
        <div>
            <h1>Equipment</h1>

            {props.selectedCharacter && (
                <div>
                    <CharacterHeader 
                        character={props.selectedCharacter}
                        currentWeight={props.currentWeight}
                        inventoryValue={props.inventoryValue}
                    />
                </div>
            )}
        </div>
    )
}

export default EquipmentPage
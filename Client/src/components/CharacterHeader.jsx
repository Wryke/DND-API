function CharacterHeader(props) {
    return (
        <div className="character-header">
            <h2>{props.character.name}</h2>

            <p>
                Weight: {props.currentWeight} / {props.character.max_weight} lbs
            </p>

            <p>
                Inventory Value: {props.inventoryValue} gp
            </p>
        </div>
    )
}

export default CharacterHeader
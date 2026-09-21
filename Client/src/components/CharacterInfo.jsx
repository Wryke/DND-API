
function CharacterInfo(props) {
    return (
        <div>
            <h2>{props.character.name} | Max Carry Weight: {props.character.max_weight}</h2>

            <button onClick={() => props.selectCharacter(props.character)}>
                Select
            </button>

            <button onClick={() => props.removeCharacter(props.character.character_id)}>
                Delete
            </button>
        </div>
    )
}

export default CharacterInfo
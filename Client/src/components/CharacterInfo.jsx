import { useState } from 'react'

function CharacterInfo(props) {
    return (
        <div>
            <h1>Character: {props.character.name}</h1>
            <p>Max Carry Weight: {props.character.max_weight}</p>

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
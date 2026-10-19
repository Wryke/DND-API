
import { useState } from "react"
import CharacterEditForm from "./CharacterEditForm"

function CharacterInfo({
    character,
    selectCharacter,
    removeCharacter,
    updateCharacter
}) {

    // --- State ---
    const [isEditing, setIsEditing] = useState(false)

    function handleDelete() {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${character.name}? This action cannot be undone.`
        )

        if (!confirmed) {
            return
        }

        removeCharacter(character.character_id)
    }

    // --- Event Handlers ---
    function handleCancelEdit() {
        setIsEditing(false)
    }

    // -- Render ---
    if (isEditing) {
        return (
            <CharacterEditForm
                character={character}
                updateCharacter={updateCharacter}
                cancelEdit={handleCancelEdit}
            />
        )
    }

    return (
        <div>
            <h2>
                {character.name} | Max Carry Weight: {character.max_weight} lbs
            </h2>

            <button
                type="button"
                onClick={() => selectCharacter(character)}
            >
                Select
            </button>

            <button
                type="button"
                onClick={() => setIsEditing(true)}
            >
                Edit
            </button>

            <button
                type="button"
                onClick={handleDelete}
            >
                Delete
            </button>
        </div>
    )
}

export default CharacterInfo

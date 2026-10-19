
import { useState } from "react"

import Modal from "../Modal"
import CharacterEditForm from "./CharacterEditForm"

function CharacterCard({
    character,
    selectedCharacter,
    selectCharacter,
    removeCharacter,
    updateCharacter
}) {

    // --- State ---
    const [isEditing, setIsEditing] = useState(false)

    // --- Derived Data ---
    const isSelected = selectedCharacter?.character_id === character.character_id

    // --- Event Handlers ---
    function handleEditClick() {
        setIsEditing(true)
    }

    function handleEditClose() {
        setIsEditing(false)
    }

    function handleDelete() {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${character.name}? This action cannot be undone.`
        )

        if (!confirmed) {
            return
        }

        removeCharacter(character.character_id)
    }

    // --- Render ---
    return (
        <div className={`character-card ${isSelected ? "selected" : ""}`}>
            <h2>{character.name}</h2>

            <p>
                Max Carry Weight: {character.max_weight} lbs
            </p>

            <button
                type="button"
                onClick={() => selectCharacter(character)}
                disabled={isSelected}
            >
                {isSelected ? "Selected" : "Select"}
            </button>

            <button
                type="button"
                onClick={handleEditClick}
            >
                Edit
            </button>

            <button
                type="button"
                onClick={handleDelete}
            >
                Delete
            </button>

            {isEditing && (
                <Modal>
                    <CharacterEditForm
                        character={character}
                        updateCharacter={updateCharacter}
                        cancelEdit={handleEditClose}
                    />
                </Modal>
            )}
        </div>
    )
}

export default CharacterCard
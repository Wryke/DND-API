function CharacterInfo({ character, selectCharacter, removeCharacter }) {

    // --- Event Handlers
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
                onClick={handleDelete}
            >
                Delete
            </button>
        </div>
    )
}

export default CharacterInfo
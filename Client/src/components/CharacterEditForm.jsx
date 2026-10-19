
import { useState } from "react"

function CharacterEditForm({ character, updateCharacter, cancelEdit }) {

    // --- State ---
    const [name, setName] = useState(character.name)
    const [maxWeight, setMaxWeight] = useState(String(character.max_weight))

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // --- Event Handlers ---
    async function handleSubmit(event) {
        event.preventDefault()

        setError("")

        const trimmedName = name.trim()
        const numericMaxWeight = Number(maxWeight)

        if (trimmedName === "") {
            setError("Character name is required.")
            return
        }

        if (
            maxWeight.trim() === "" ||
            !Number.isInteger(numericMaxWeight) ||
            numericMaxWeight <= 0
        ) {
            setError("Maximum carry weight must be a positive whole number.")
            return
        }

        try {
            setLoading(true)

            const errorMessage = await updateCharacter(
                character.character_id,
                {
                    name: trimmedName,
                    max_weight: numericMaxWeight
                }
            )

            if (errorMessage) {
                setError(errorMessage)
                return
            }

            cancelEdit()
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Render ---
    return (
        <form onSubmit={handleSubmit}>
            <h3>Edit {character.name}</h3>

            <label htmlFor={`edit-name-${character.character_id}`}>
                Character Name
            </label>

            <input
                id={`edit-name-${character.character_id}`}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
            />

            <label htmlFor={`edit-weight-${character.character_id}`}>
                Maximum Carry Weight (lbs)
            </label>

            <input
                id={`edit-weight-${character.character_id}`}
                type="number"
                min="1"
                step="1"
                value={maxWeight}
                onChange={(event) => setMaxWeight(event.target.value)}
                disabled={loading}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
            >
                Cancel
            </button>
        </form>
    )
}

export default CharacterEditForm
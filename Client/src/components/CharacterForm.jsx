import { useState } from 'react'

function CharacterForm(props) {
    const [error, setError] = useState("")
    
    const [name, setName] = useState("")
    const [maxWeight, setMaxWeight] = useState("")

    async function handleSubmit(event) {
        event.preventDefault()

        const numericMaxWeight = Number(maxWeight)
        
        if(name.trim() === ""){
            setError("Character name is required.")
            return
        }

        if (
            Number.isNaN(numericMaxWeight) || 
            numericMaxWeight <= 0 || 
            !Number.isInteger(numericMaxWeight)
        ) {
            setError("Character max weight must be a positive whole number.")
            return
        }

        const result = await props.addCharacter(
            name.trim(),
            numericMaxWeight
        )

        if (result !== null) {
            setError(result)
            return
        }

        setError("")
        setName("")
        setMaxWeight("")
    }

    return (
        <form onSubmit={handleSubmit}>
            
            <label htmlFor="character-name">Character Name</label>
            <input
                id="character-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="character-max-weight">Maximum Carry Weight (lbs)</label>
            <input
                id="character-max-weight"
                type="number"
                min="1"
                step="1"
                value={maxWeight}
                onChange={(event) => setMaxWeight(event.target.value)}
            />

            {error && <p>{error}</p>}
            
            <button type="submit">
                Add Character
            </button>
        </form>
    )
}

export default CharacterForm
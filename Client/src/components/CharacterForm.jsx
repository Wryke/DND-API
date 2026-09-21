import { useState } from 'react'

function CharacterForm(props) {
    const [error, setError] = useState("")
    
    const [name, setName] = useState("")
    const [max_weight, setMaxWeight] = useState("")

    async function handleSubmit(event) {
        event.preventDefault()

        const numericMaxWeight = Number(max_weight)
        
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

            <input
                placeholder="Name"
                value={name}
                onChange={(event) => {
                    setName(event.target.value)
                }}
            />

            <input
                placeholder="Max Weight"
                value={max_weight}
                onChange={(event) => {
                    setMaxWeight(event.target.value)
                }}
            />

            {error && <p>{error}</p>}
            
            <button type="submit">
                Add Character
            </button>
        </form>
    )
}

export default CharacterForm
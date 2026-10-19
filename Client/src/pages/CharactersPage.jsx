import CharacterForm from "../components/characters/CharacterForm"

function CharactersPage({ addCharacter, characterElements }) {
    return (
        <div>
            <h1>Characters</h1>

            <CharacterForm addCharacter={addCharacter} />

            <div className="character-grid">
                {characterElements}
            </div>
        </div>
    )
}

export default CharactersPage
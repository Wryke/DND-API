import CharacterForm from '../components/characters/CharacterForm'
import CharacterHeader from '../components/characters/CharacterHeader'

function CharactersPage(props) {
    return (
        <div>
            <h1>Characters</h1>

            <CharacterForm 
                addCharacter={props.addCharacter}
            />

            {props.characterElements}
        </div>
    )
}

export default CharactersPage
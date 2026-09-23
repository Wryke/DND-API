import CharacterForm from '../components/CharacterForm'
import CharacterHeader from '../components/CharacterHeader'

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
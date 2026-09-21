import { useEffect, useState } from 'react'
import './App.css'

import MagicClicker from './components/MagicClicker'
import CharacterInfo from './components/CharacterInfo'
import CharacterForm from './components/CharacterForm'
import InventoryItem from './components/InventoryItem'
import AddInventoryItemForm from './components/AddInventoryItemForm'

function App() {
    
    const [characters, setCharacters] = useState([])
    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [inventory, setInventory] = useState([])

    // -- Use Effects --
    useEffect(() => {
        async function loadCharacters() {
            
            const response = await fetch("http://localhost:3000/users/1/characters")
            
            const data = await response.json()

            setCharacters(data)
        }

        loadCharacters()
    }, [])

    useEffect(() => {
        if (selectedCharacter === null) {
            setInventory([])
            return
        }

        async function loadInventory(){
            setInventory([])

            const response = await fetch(`http://localhost:3000/users/1/characters/${selectedCharacter.name}/inventory`)
                
            const data = await response.json()

            setInventory(data)
        }

        loadInventory()
    }, [selectedCharacter])

    useEffect(() => {
        console.log("Characters changed:", characters)
    }, [characters])

    function selectCharacter(character){
        setSelectedCharacter(character)
    }

    // -- Other Functions --
    async function addInventoryItem(itemIndex, quantity) {
        if (
            typeof itemIndex !== "string" ||
            itemIndex === "" ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return "Invalid Inventory Request"
        }
        
        const newEntry = {
            item_index: itemIndex,
            parent_inventory_id: null,
            quantity: quantity
        }

        const response = await fetch(
            `http://localhost:3000/users/1/characters/${encodeURIComponent(selectedCharacter.name)}/inventory`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newEntry)
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return data.error
        }

        setInventory([...inventory, data])
        
        return null
    }

    function addCharacter(name, maxWeight) {
        setCharacters((currentCharacters) => {
            const nextId = Math.max(
                ...currentCharacters.map((character) => character.character_id),
                0
            ) + 1

            const newCharacter = {
                character_id: nextId,
                name: name,
                max_weight: Number(maxWeight)
            }

            return [
                ...currentCharacters,
                newCharacter
            ]
        })
    }

    function removeCharacter(characterId) {
        setCharacters((currentCharacters) => {
            return currentCharacters.filter((character) => {
                return character.character_id !== characterId
            })
        })
    }

    const characterElements = characters.map((character) => {
        return (
            <CharacterInfo 
                key={character.character_id}
                character={character}
                selectCharacter={selectCharacter}
                removeCharacter={removeCharacter}
            />
        )
    })

    const inventoryElements = inventory.map((item) => {
        return (
            <InventoryItem
                key={item.inventory_id}
                item={item}
                userId={1}
                characterName={selectedCharacter.name}
            />
        )
    })

    return (
        <>
            <MagicClicker/>

            <CharacterForm addCharacter={addCharacter}/>

            {characterElements}

            {selectedCharacter && (
                <div>
                    <h2>Selected Character</h2>
                    <p>{selectedCharacter.name}</p>
                </div>
            )}

            <div>
                <h2>Inventory</h2>
                {inventoryElements}

                <AddInventoryItemForm addInventoryItem={addInventoryItem} />
            </div>
        </>
    )
}

export default App

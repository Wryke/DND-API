import { useEffect, useState } from 'react'
import './App.css'

import InventoryPage from './pages/InventoryPage'

import CharacterInfo from './components/CharacterInfo'
import CharacterForm from './components/CharacterForm'
import InventoryItem from './components/InventoryItem'
import Sidebar from './components/Sidebar'

function App() {
    
    const [characters, setCharacters] = useState([])
    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [inventory, setInventory] = useState([])
    const [currentPage, setCurrentPage] = useState("home")

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

    async function addCharacter(name, maxWeight) {
        
        const newCharacter = {
            user_id: Number(1),
            name: name,
            max_weight: Number(maxWeight)
        }

        const response = await fetch(
            `http://localhost:3000/users/1/characters`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newCharacter)
            }
        )

        const data = await response.json()

        if(!response.ok){
            return data.error
        }
        
        setCharacters((currentCharacters) => {
            return [
                ...currentCharacters,
                data
            ]
        })

        return null
    }

    async function removeCharacter(characterId) {
        // Find the character being deleted
        const character = characters.find((character) => {
            return character.character_id === characterId
        })

        if (!character) {
            return "Character not found"
        }

        // Delete the character from the database
        const response = await fetch(
            `http://localhost:3000/users/1/characters/${encodeURIComponent(character.name)}`,
            {
                method: "DELETE"
            }
        )

        // If the DELETE failed, get the backend error
        if (!response.ok) {
            const data = await response.json()
            return data.error
        }

        // Only update React state after the database DELETE succeeds
        setCharacters((currentCharacters) => {
            return currentCharacters.filter((character) => {
                return character.character_id !== characterId
            })
        })

        if (selectedCharacter?.character_id === characterId) {
            selectCharacter(null)
        }

        return null
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
            <Sidebar setCurrentPage={setCurrentPage} />
            {currentPage === "home" && (
                <div>
                    <h1>Home</h1>
                </div>
            )}

            {currentPage === "characters" && (
                <div>
                    <h1>-- Characters --</h1>
                    <CharacterForm addCharacter={addCharacter}/>
                    {characterElements}

                    {selectedCharacter && (
                        <div>
                            <h2>_______________________________________________________</h2>
                            <h2>Selected Character: {selectedCharacter.name} | {selectedCharacter.max_weight} lbs</h2>
                            <h2>_______________________________________________________</h2>
                        </div>
                    )}
                </div>
            )}

            {currentPage === "inventory" && (
                <InventoryPage
                    selectedCharacter={selectedCharacter}
                    addInventoryItem={addInventoryItem}
                    inventoryElements={inventoryElements}
                />
            )}

            {currentPage === "equipment" && (
                <div>
                    <h1>Equipment</h1>
                </div>
            )}
        </>
    )
}

export default App

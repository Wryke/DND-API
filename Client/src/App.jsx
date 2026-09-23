import { useEffect, useState } from 'react'
import './App.css'

import HomePage from './pages/HomePage'
import CharactersPage from './pages/CharactersPage'
import InventoryPage from './pages/InventoryPage'
import EquipmentPage from './pages/EquipmentPage'

import Sidebar from './components/Sidebar'
import CharacterInfo from './components/CharacterInfo'

import { convertToGold } from './utils/currency'

function App() {
    
    const [characters, setCharacters] = useState([])
    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [inventory, setInventory] = useState([])
    const [currentPage, setCurrentPage] = useState("home")

    
    const currentWeight = inventory.reduce((total, item) => {
        return total + (item.weight * item.quantity)
    }, 0)

    const inventoryValue = inventory.reduce((total, item) => {
        const unitGoldValue = convertToGold(item.cost_quantity, item.currency_code)

        return total + (unitGoldValue * item.quantity)
    }, 0)

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

            const response = await fetch(`http://localhost:3000/users/1/characters/${encodeURIComponent(selectedCharacter.name)}/inventory/all`)
                
            const data = await response.json()

            setInventory(data)
        }

        loadInventory()
    }, [selectedCharacter])

    function selectCharacter(character){
        setSelectedCharacter(character)
    }

    // -- Other Functions --
    async function addInventoryItem(itemIndex, quantity, parentInventoryId) {

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
            parent_inventory_id: parentInventoryId,
            quantity: quantity
        }

        try {
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

            setInventory((currentInventory) => {
                return [...currentInventory, data]
            })

            return null
        }
        catch (error) {
            console.error(error)
            return "Unable to add item. Please try again."
        }
    }

    async function updateInventoryItem(inventoryId, quantity, parentInventoryId) {
        const updatedEntry = {
            quantity: quantity,
            parent_inventory_id: parentInventoryId
        }

        try {
            const response = await fetch(
                `http://localhost:3000/users/1/characters/${encodeURIComponent(selectedCharacter.name)}/inventory/${inventoryId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedEntry)
                }
            )

            const data = await response.json()

            if (!response.ok) {
                return data.error
            }

            setInventory((currentInventory) => {
                return currentInventory.map((item) => {
                    if (item.inventory_id === inventoryId) {
                        return data
                    }

                    return item
                })
            })

            return null
        }
        catch (error) {
            console.error(error)
            return "Unable to update item. Please try again."
        }
    }

    async function removeInventoryItem(inventoryId) {
        try {
            const response = await fetch(
                `http://localhost:3000/users/1/characters/${encodeURIComponent(selectedCharacter.name)}/inventory/${inventoryId}`,
                {
                    method: "DELETE"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                return data.error
            }

            setInventory(data.inventory)

            return null
        }
        catch (error) {
            console.error(error)
            return "Unable to remove item. Please try again."
        }
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

    return (
        <>
            <div className="app-layout">

                <Sidebar 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage} 
                />

                <main className="main-content">

                    {currentPage === "home" && (
                        <HomePage />
                    )}

                    {currentPage === "characters" && (
                        <CharactersPage
                            selectedCharacter={selectedCharacter}
                            addCharacter={addCharacter}
                            characterElements={characterElements}
                        />
                    )}

                    {currentPage === "inventory" && (
                        <InventoryPage
                            selectedCharacter={selectedCharacter}
                            currentWeight={currentWeight}
                            inventoryValue={inventoryValue}
                            addInventoryItem={addInventoryItem}
                            updateInventoryItem={updateInventoryItem}
                            removeInventoryItem={removeInventoryItem}
                            inventory={inventory}
                        />
                    )}

                    {currentPage === "equipment" && (
                        <EquipmentPage
                            selectedCharacter={selectedCharacter}
                            currentWeight={currentWeight}
                            inventoryValue={inventoryValue}
                        />
                    )}
                </main>
            </div>
        </>
    )
}

export default App

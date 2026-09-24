import { useEffect, useState } from 'react'
import './App.css'

import HomePage from './pages/HomePage'
import CharactersPage from './pages/CharactersPage'
import InventoryPage from './pages/InventoryPage'
import EquipmentPage from './pages/EquipmentPage'

import Sidebar from './components/Sidebar'
import CharacterInfo from './components/CharacterInfo'

import { convertToGold } from './utils/currency'

import { 
    getCharacters, 
    createCharacter, 
    deleteCharacter 
} from './api/characters'

import { 
    getCharacterInventory,
    addInventoryEntry,
    updateInventoryEntry,
    deleteInventoryEntry 
} from './api/inventory'

function App() {
    
    // --- State ---
    const [characters, setCharacters] = useState([])
    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [inventory, setInventory] = useState([])
    const [currentPage, setCurrentPage] = useState("home")

    // --- Derived Data ---
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
            try {
                const data = await getCharacters(1)

                setCharacters(data)
            }
            catch (error) {
                console.error(error)
            }
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

            try {
                const data = await getCharacterInventory(1, selectedCharacter.name)

                setInventory(data)
            }
            catch (error) {
                console.error(error)
            }
        }

        loadInventory()
    }, [selectedCharacter])

    // Inventory Functions
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
            const data = await addInventoryEntry(1, selectedCharacter.name, newEntry)

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
            const data = await updateInventoryEntry(1, selectedCharacter.name, inventoryId, updatedEntry)

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
            const data = await deleteInventoryEntry(1, selectedCharacter.name, inventoryId)

            setInventory(data.inventory)

            return null
        }
        catch (error) {
            console.error(error)
            return "Unable to remove item. Please try again."
        }
    }

    // Character Functions
    async function addCharacter(name, maxWeight) {

        const newCharacter = {
            user_id: Number(1),
            name: name,
            max_weight: Number(maxWeight)
        }

        try {
            const data = await createCharacter(1, newCharacter)

            setCharacters((currentCharacters) => {
                return [
                    ...currentCharacters,
                    data
                ]
            })
        } catch(error) {
            console.error(error)
            return error.message
        }

        return null
    }

    async function removeCharacter(characterId) {
        const character = characters.find((character) => {
            return character.character_id === characterId
        })

        if (!character) {
            return "Character not found"
        }

        try {
            await deleteCharacter(1, character.name)

            setCharacters((currentCharacters) => {
                return currentCharacters.filter((character) => {
                    return character.character_id !== characterId
                })
            })

            if (selectedCharacter?.character_id === characterId) {
                selectCharacter(null)
            }
        }
        catch (error) {
            console.error(error)
            return error.message
        }

        return null
    }

    // --- Event Handlers ---
    function selectCharacter(character){
        setSelectedCharacter(character)
    }

    // --- Render ---
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

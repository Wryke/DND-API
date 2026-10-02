import { useEffect, useState } from 'react'
import './App.css'

import HomePage from './pages/HomePage'
import CharactersPage from './pages/CharactersPage'
import InventoryPage from './pages/InventoryPage'
import EquipmentPage from './pages/EquipmentPage'

import Sidebar from './components/Sidebar'
import CharacterInfo from './components/CharacterInfo'

import { 
    convertToGold 
} from './utils/currency'

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

import { 
    getCharacterEquipment,
    getEquipmentSlots
} from "./api/equipment"

function App() {
    
    // --- State ---
    const [characters, setCharacters] = useState([])
    const [selectedCharacter, setSelectedCharacter] = useState(null)

    const [inventory, setInventory] = useState([])

    const [equipment, setEquipment] = useState([])
    const [equipmentSlots, setEquipmentSlots] = useState([])

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
                const data = await getCharacters()

                setCharacters(data)
            }
            catch (error) {
                console.error(error)
            }
        }

        async function loadEquipmentSlots() {
            try {
                const data = await getEquipmentSlots()

                setEquipmentSlots(data)
            }
            catch (error) {
                console.error(error)
            }
        }

        loadCharacters()
        loadEquipmentSlots()
    }, [])

    useEffect(() => {
        if (selectedCharacter === null) {
            setInventory([])
            setEquipment([])
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

        async function loadEquipment(){
            setEquipment([])

            try {
                const data = await getCharacterEquipment(selectedCharacter.name)

                setEquipment(data)
            }
            catch (error) {
                console.error(error)
            }
        }

        loadInventory()
        loadEquipment()
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
            name: name,
            max_weight: Number(maxWeight)
        }

        try {
            const data = await createCharacter(newCharacter)

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
            await deleteCharacter(character.name)

            setCharacters((currentCharacters) => {
                return currentCharacters.filter((character) => {
                    return character.character_id !== characterId
                })
            })

            if (selectedCharacter?.character_id === characterId) {
                handleSelectCharacter(null)
            }
        }
        catch (error) {
            console.error(error)
            return error.message
        }

        return null
    }

    // --- Event Handlers ---
    function handleSelectCharacter(character){
        setSelectedCharacter(character)
    }

    function handleEquipmentAdded (newEquipmentEntry){
        setEquipment([
            ...equipment,
            newEquipmentEntry
        ])
    }

    function handleEquipmentRemoved(equipmentId) {
        setEquipment((equipment) => {
            return equipment.filter((equipmentEntry) => {
                return equipmentEntry.equipment_id !== equipmentId
            })
        })
    }

    // --- Render ---
    const characterElements = characters.map((character) => {
        return (
            <CharacterInfo 
                key={character.character_id}
                character={character}
                selectCharacter={handleSelectCharacter}
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
                    selectedCharacter={selectedCharacter}
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
                            equipmentSlots={equipmentSlots}
                            equipment={equipment}
                            inventory={inventory}
                            onEquipmentAdded={handleEquipmentAdded}
                            onEquipmentRemoved={handleEquipmentRemoved}
                        />
                    )}
                </main>
            </div>
        </>
    )
}

export default App

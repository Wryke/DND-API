import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const character = {
        name: "Wryke",
        maxWeight: 100,
        level: 5
  }

  return (
    <>
      <h1>{character.name}</h1>
      <p>Max Carry Weight: {character.maxWeight}<br></br>Current Level: {character.level}</p>
    </>
  )
}

export default App

import { useState } from 'react'

function MagicClicker() {
    const [clicks, updateClicks] = useState(1)

    function incrementClicks() {
        updateClicks(clicks + 1)
    }

    return (
        <div>
            <p>Magic Clicker Button: {clicks}</p>
            <button onClick={incrementClicks}>!!More Clicks!!</button>
        </div>
    )
}

export default MagicClicker
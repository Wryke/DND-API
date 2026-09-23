function Sidebar(props) {

    return (
        <div>
            <button onClick={() => props.setCurrentPage("home")}>
                Home
            </button>

            <button onClick={() => props.setCurrentPage("characters")}>
                Characters
            </button>

            <button onClick={() => props.setCurrentPage("inventory")}>
                Inventory
            </button>

            <button onClick={() => props.setCurrentPage("equipment")}>
                Equipment
            </button>

            <button onClick={() => props.setCurrentPage("log out")}>
                Log Out
            </button>
        </div>
    )
}

export default Sidebar
import { useState } from "react"

function AccountPage(props) {

    // --- State ---
    const [newUsername, setNewUsername] = useState(props.currentUser.username)
    const [currentPassword, setCurrentPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    // --- Event Handlers ---
    async function handleUsernameSubmit(event) {
        event.preventDefault()

        setError("")
        setSuccess("")

        if (newUsername.trim() === "") {
            setError("Username cannot be empty")
            return
        }

        if(currentPassword.trim() === "") {
            setError("Current password is required.")
            return
        }

        try {
            setLoading(true)

            const errorMessage = await props.handleUpdateUser({
                username: newUsername,
                currentPassword: currentPassword
            })

            if (errorMessage) {
                setError(errorMessage)
                return
            }

            setSuccess("Username updated successfully.")
            setCurrentPassword("")
        } catch(error){
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Render ---
    return (
        <div>
            <h1>Account Settings</h1>

            <h2>Profile Information</h2>

            <p>
                <strong>Username:</strong> {props.currentUser.username}
            </p>

            <p>
                <strong>Email:</strong> {props.currentUser.email}
            </p>

            <h2>Change Username</h2>

            <form onSubmit = {handleUsernameSubmit}>
                <label htmlFor="new-username">
                    New Username
                </label>

                <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(event) => {
                        setNewUsername(event.target.value)
                    }}
                />

                <label htmlFor="username-current-password">
                    Current Password
                </label>

                <input
                    id="username-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => {
                        setCurrentPassword(event.target.value)
                    }}
                />

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Username"}
                </button>
            </form>
        </div>
    )
}

export default AccountPage
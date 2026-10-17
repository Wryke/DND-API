import { useState } from "react"

function AccountPage(props) {

    // --- State ---
    const [newUsername, setNewUsername] = useState(props.currentUser.username)
    const [currentPassword, setCurrentPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const [newEmail, setNewEmail] = useState(props.currentUser.email)
    const [emailPassword, setEmailPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [emailSuccess, setEmailSuccess] = useState("")
    const [emailLoading, setEmailLoading] = useState(false)

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)

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

    async function handleEmailSubmit(event) {
        event.preventDefault()

        setEmailError("")
        setEmailSuccess("")

        if (newEmail.trim() === "") {
            setEmailError("Email cannot be empty.")
            return
        }

        if (emailPassword.trim() === "") {
            setEmailError("Current password is required.")
            return
        }

        try {
            setEmailLoading(true)

            const errorMessage = await props.handleUpdateUser({
                email: newEmail,
                currentPassword: emailPassword
            })

            if (errorMessage) {
                setEmailError(errorMessage)
                return
            }

            setEmailSuccess("Email updated successfully.")
            setEmailPassword("")
        }
        catch (error) {
            setEmailError(error.message)
        }
        finally {
            setEmailLoading(false)
        }
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault()

        setPasswordError("")
        setPasswordSuccess("")

        if (oldPassword === "") {
            setPasswordError("Current password is required.")
            return
        }

        if (newPassword.length < 8 || newPassword.length > 16) {
            setPasswordError("New password must be 8-16 characters.")
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.")
            return
        }

        try {
            setPasswordLoading(true)

            const errorMessage = await props.handleUpdateUser({
                password: newPassword,
                currentPassword: oldPassword
            })

            if (errorMessage) {
                setPasswordError(errorMessage)
                return
            }

            setPasswordSuccess("Password updated successfully.")

            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        }
        catch (error) {
            setPasswordError(error.message)
        }
        finally {
            setPasswordLoading(false)
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

            <h2>Change Email</h2>

            <form onSubmit={handleEmailSubmit}>
                <label htmlFor="new-email">
                    New Email
                </label>

                <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) => {
                        setNewEmail(event.target.value)
                    }}
                />

                <label htmlFor="email-current-password">
                    Current Password
                </label>

                <input
                    id="email-current-password"
                    type="password"
                    value={emailPassword}
                    onChange={(event) => {
                        setEmailPassword(event.target.value)
                    }}
                />

                {emailError && <p>{emailError}</p>}
                {emailSuccess && <p>{emailSuccess}</p>}

                <button
                    type="submit"
                    disabled={emailLoading}
                >
                    {emailLoading ? "Updating..." : "Update Email"}
                </button>
            </form>

            <h2>Change Password</h2>

            <form onSubmit={handlePasswordSubmit}>
                <label htmlFor="old-password">
                    Current Password
                </label>

                <input
                    id="old-password"
                    type="password"
                    autoComplete="current-password"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                />

                <label htmlFor="new-password">
                    New Password
                </label>

                <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                />

                <label htmlFor="confirm-password">
                    Confirm New Password
                </label>

                <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />

                {passwordError && <p>{passwordError}</p>}
                {passwordSuccess && <p>{passwordSuccess}</p>}

                <button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    )
}

export default AccountPage
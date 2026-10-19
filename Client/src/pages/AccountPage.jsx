import { useState } from "react"

function AccountPage({ currentUser, handleUpdateUser, handleDeleteUser }) {

    // --- State ---
    const [newUsername, setNewUsername] = useState(currentUser.username)
    const [usernamePassword, setUsernamePassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [usernameSuccess, setUsernameSuccess] = useState("")
    const [usernameLoading, setUsernameLoading] = useState(false)

    const [newEmail, setNewEmail] = useState(currentUser.email)
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

    const [deletePassword, setDeletePassword] = useState("")
    const [confirmDeletion, setConfirmDeletion] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)

    // --- Event Handlers ---
    async function handleUsernameSubmit(event) {
        event.preventDefault()

        setUsernameError("")
        setUsernameSuccess("")

        if (newUsername.trim() === "") {
            setUsernameError("Username cannot be empty")
            return
        }

        if (usernamePassword === "") {
            setUsernameError("Current password is required.")
            return
        }

        try {
            setUsernameLoading(true)

            const errorMessage = await handleUpdateUser({
                username: newUsername.trim(),
                currentPassword: usernamePassword
            })

            if (errorMessage) {
                setUsernameError(errorMessage)
                return
            }

            setUsernameSuccess("Username updated successfully.")
            setUsernamePassword("")
        } catch (error) {
            setUsernameError(error.message)
        } finally {
            setUsernameLoading(false)
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

        if (emailPassword === "") {
            setEmailError("Current password is required.")
            return
        }

        try {
            setEmailLoading(true)

            const errorMessage = await handleUpdateUser({
                email: newEmail.trim(),
                currentPassword: emailPassword
            })

            if (errorMessage) {
                setEmailError(errorMessage)
                return
            }

            setEmailSuccess("Email updated successfully.")
            setEmailPassword("")
        } catch (error) {
            setEmailError(error.message)
        } finally {
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

            const errorMessage = await handleUpdateUser({
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
        } catch (error) {
            setPasswordError(error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    async function handleDeleteSubmit(event) {
        event.preventDefault()

        setDeleteError("")

        if (deletePassword === "") {
            setDeleteError("Current password is required.")
            return
        }

        if (!confirmDeletion) {
            setDeleteError("You must confirm account deletion.")
            return
        }

        try {
            setDeleteLoading(true)

            const errorMessage = await handleDeleteUser(deletePassword)

            if (errorMessage) {
                setDeleteError(errorMessage)
                return
            }

            // App.jsx handles clearing currentUser and navigation.
        } catch (error) {
            setDeleteError(error.message)
        } finally {
            setDeleteLoading(false)
        }
    }

    // --- Render ---
    return (
        <main>
            <h1>Account Settings</h1>

            <section>
                <h2>Profile Information</h2>

                <p>
                    <strong>Username:</strong> {currentUser.username}
                </p>

                <p>
                    <strong>Email:</strong> {currentUser.email}
                </p>
            </section>

            <section>
                <h2>Change Username</h2>

                <form onSubmit={handleUsernameSubmit}>
                    <label htmlFor="new-username">
                        New Username
                    </label>

                    <input
                        id="new-username"
                        type="text"
                        autoComplete="username"
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
                        autoComplete="current-password"
                        value={usernamePassword}
                        onChange={(event) => {
                            setUsernamePassword(event.target.value)
                        }}
                    />

                    {usernameError && <p role="alert">{usernameError}</p>}
                    {usernameSuccess && <p role="status">{usernameSuccess}</p>}

                    <button
                        type="submit"
                        disabled={usernameLoading}
                    >
                        {usernameLoading ? "Updating..." : "Update Username"}
                    </button>
                </form>
            </section>

            <section>
                <h2>Change Email</h2>

                <form onSubmit={handleEmailSubmit}>
                    <label htmlFor="new-email">
                        New Email
                    </label>

                    <input
                        id="new-email"
                        type="email"
                        autoComplete="email"
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
                        autoComplete="current-password"
                        value={emailPassword}
                        onChange={(event) => {
                            setEmailPassword(event.target.value)
                        }}
                    />

                    {emailError && <p role="alert">{emailError}</p>}
                    {emailSuccess && <p role="status">{emailSuccess}</p>}

                    <button
                        type="submit"
                        disabled={emailLoading}
                    >
                        {emailLoading ? "Updating..." : "Update Email"}
                    </button>
                </form>      
            </section>

            <section>
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

                    {passwordError && <p role="alert">{passwordError}</p>}
                    {passwordSuccess && <p role="status">{passwordSuccess}</p>}

                    <button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </section>

            <section>
                <h2>Delete Account</h2>

                <p>
                    Deleting your account is permanent and cannot be undone.
                </p>

                <form onSubmit={handleDeleteSubmit}>
                    <label htmlFor="delete-password">
                        Current Password
                    </label>

                    <input
                        id="delete-password"
                        type="password"
                        autoComplete="current-password"
                        value={deletePassword}
                        onChange={(event) => {
                            setDeletePassword(event.target.value)
                        }}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={confirmDeletion}
                            onChange={(event) => {
                                setConfirmDeletion(event.target.checked)
                            }}
                        />

                        I understand that deleting my account is permanent.
                    </label>

                    {deleteError && <p role="alert">{deleteError}</p>}

                    <button
                        type="submit"
                        disabled={deleteLoading || !confirmDeletion}
                    >
                        {deleteLoading ? "Deleting..." : "Delete Account"}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default AccountPage
import { useState } from 'react'

function RegisterForm(props) {
    // --- State ---
    const [error, setError] = useState("")

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)

    // --- Event Handlers ---
    async function handleSubmit(event) {
        event.preventDefault()

        setError("")

        if(username.trim() === ""){
            setError("Username is required.")
            return
        }

        if(email.trim() === ""){
            setError("Email is required.")
            return
        }

        if (password.trim() === "") {
            setError("Password is required.")
            return
        }

        try {
            setLoading(true)

            const errorMessage = await props.handleRegister(username, email, password)

            if (errorMessage) {
                setError(errorMessage)
                return
            }
        }
        finally {
            setLoading(false)
        }
    }

    // --- Render ---
    return (
        <form
            className="auth-form"
            onSubmit={handleSubmit}
        >

            <input
                placeholder="Username"
                value={username}
                onChange={(event) => {
                    setUsername(event.target.value)
                }}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => {
                    setEmail(event.target.value)
                }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => {
                    setPassword(event.target.value)
                }}
            />

            {error && <p>{error}</p>}
            
            <button 
                className="auth-submit-button"
                type="submit" 
                disabled={loading}
            >
                {loading ? "Creating Account..." : "Create Account"}
            </button>
        </form>
    )
}

export default RegisterForm
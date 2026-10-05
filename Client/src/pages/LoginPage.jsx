import { useState } from "react"

import "../styles/auth.css"

import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"

function LoginPage(props) {

    // --- State ---
    const [showRegister, setShowRegister] = useState(false)

    // --- Render ---
    return (
        <div className="auth-page">
            <div className="auth-header">
                <h1>D&D Inventory</h1>
                <p>Manage your characters and adventuring gear.</p>
            </div>

            <div className="auth-card">
                {showRegister ? (
                    <>
                        <h2>Create Account</h2>

                        <RegisterForm
                            handleRegister={props.handleRegister}
                        />

                        <p className="auth-switch-text">
                            Already have an account?
                        </p>

                        <button
                            className="auth-switch-button"
                            onClick={() => setShowRegister(false)}
                        >
                            Log In
                        </button>
                    </>
                ) : (
                    <>
                        <h2>Welcome Back</h2>

                        <LoginForm
                            handleLogin={props.handleLogin}
                        />

                        <p className="auth-switch-text">
                            Don't have an account?
                        </p>

                        <button
                            className="auth-switch-button"
                            onClick={() => setShowRegister(true)}
                        >
                            Create Account
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
export default LoginPage
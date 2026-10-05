import LoginForm from "../components/LoginForm"

function LoginPage(props) {

    // --- Render ---
    return (
        <div>
            <LoginForm 
                handleLogin={props.handleLogin}
            />
        </div>
    )
}

export default LoginPage
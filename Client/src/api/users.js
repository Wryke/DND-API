import { apiRequest } from "./apiHelpers"

async function register(username, email, password) {
    const newUser = {
        username: username,
        email: email,
        password: password
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    }

    return apiRequest("/users", options)
}

export { register }
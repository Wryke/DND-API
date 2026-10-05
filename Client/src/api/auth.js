import { apiRequest } from "./apiHelpers"

async function login(username, password) {
    const credentials = {
        username: username,
        password: password
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    }

    return apiRequest("/auth/login", options)
}

async function getCurrentUser() {
    return apiRequest("/auth/me")
}

async function logout() {
    const options = {
        method: "POST"
    }

    return apiRequest("/auth/logout", options)
}

export {
    login,
    getCurrentUser,
    logout
}
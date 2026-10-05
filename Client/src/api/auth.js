import { apiRequest } from "./apiHelpers"

async function login(email, password) {
    const credentials = {
        email: email,
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
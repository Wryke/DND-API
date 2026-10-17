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

async function updateUser(updatedFields) {
    const options = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedFields)
    }

    return apiRequest("/users/me", options)
}

export { 
    register,
    updateUser
 }
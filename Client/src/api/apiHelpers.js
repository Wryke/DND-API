const API_BASE_URL = "http://localhost:3000"

export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            credentials: "include"
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Request failed")
    }

    return data
}

export { apiRequest }
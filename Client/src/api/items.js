import { apiRequest } from "./apiHelpers"

async function getItems() {
    return apiRequest("/items")
}

export { getItems }
const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")

describe("User Routes", () => {
    let testUser
    let testCharacter
    let additionalUserIds

    beforeEach(async () => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username: `TestUser_${uniqueSuffix}`,
                password: "testpass"
            })

        expect(userResponse.status).toBe(201)

        testUser = userResponse.body

        const characterResponse = await request(app)
            .post(`/users/${testUser.user_id}/characters`)
            .send({
                name: `TestCharacter_${uniqueSuffix}`,
                max_weight: 100
            })

        expect(characterResponse.status).toBe(201)

        testCharacter = characterResponse.body
        additionalUserIds = []
    })

    afterEach(() => {
        /*
         * Delete additional users first.
         * Cascading deletes remove their characters and inventory.
         */
        for (const userId of additionalUserIds) {
            db.prepare(`
                DELETE FROM users
                WHERE user_id = ?
            `).run(userId)
        }

        /*
         * Some tests explicitly delete testUser.
         * Deleting it again simply changes zero rows.
         */
        db.prepare(`
            DELETE FROM users
            WHERE user_id = ?
        `).run(testUser.user_id)
    })

    // --- User Routes ---

    describe("GET /users/:id", () => {
        test("returns the requested user", async () => {
            const response = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(response.status).toBe(200)
            expect(response.body.user_id).toBe(testUser.user_id)
            expect(response.body.username).toBe(testUser.username)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .get("/users/999999999")

            expect(response.status).toBe(404)
            expect(response.body.username).toBeUndefined()
        })
    })

    describe("POST /users", () => {
        test("creates a valid user", async () => {
            const username = `TestUser_Additional_${Date.now()}`

            const response = await request(app)
                .post("/users")
                .send({
                    username,
                    password: "testpass"
                })

            expect(response.status).toBe(201)
            expect(response.body.username).toBe(username)
            expect(response.body).toHaveProperty("user_id")

            additionalUserIds.push(response.body.user_id)
        })

        test("rejects a duplicate username", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: testUser.username,
                    password: "different-password"
                })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe(
                "Username already exists"
            )
        })

        test("rejects an empty username", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: "",
                    password: "testpass"
                })

            expect(response.status).toBe(400)
        })

        test("rejects a missing password", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: `TestUser_MissingPassword_${Date.now()}`
                })

            expect(response.status).toBe(400)
        })
    })

    describe("PATCH /users/:id", () => {
        test("updates an existing username", async () => {
            const newUsername = `${testUser.username}_Updated`

            const patchResponse = await request(app)
                .patch(`/users/${testUser.user_id}`)
                .send({
                    username: newUsername
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.user_id)
                .toBe(testUser.user_id)
            expect(patchResponse.body.username)
                .toBe(newUsername)

            const getResponse = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(getResponse.status).toBe(200)
            expect(getResponse.body.username)
                .toBe(newUsername)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .patch("/users/999999999")
                .send({
                    username: `TestUser_Missing_${Date.now()}`
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe("User not found")
        })

        test("returns 400 for an empty username", async () => {
            const response = await request(app)
                .patch(`/users/${testUser.user_id}`)
                .send({
                    username: ""
                })

            expect(response.status).toBe(400)
        })

        test("returns 409 when the username already exists", async () => {
            const secondUserResponse = await request(app)
                .post("/users")
                .send({
                    username: `TestUser_Second_${Date.now()}`,
                    password: "testpass"
                })

            expect(secondUserResponse.status).toBe(201)

            additionalUserIds.push(
                secondUserResponse.body.user_id
            )

            const patchResponse = await request(app)
                .patch(`/users/${secondUserResponse.body.user_id}`)
                .send({
                    username: testUser.username
                })

            expect(patchResponse.status).toBe(409)
            expect(patchResponse.body.error).toBe(
                "Username already exists"
            )
        })
    })

    describe("DELETE /users/:id", () => {
        test("deletes an existing user", async () => {
            const response = await request(app)
                .delete(`/users/${testUser.user_id}`)

            expect(response.status).toBe(200)
            expect(response.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(getResponse.status).toBe(404)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .delete("/users/999999999")

            expect(response.status).toBe(404)
        })
    })

    // --- Character Routes ---

    describe("GET /users/:id/characters", () => {
        test("returns the user's characters", async () => {
            const response = await request(app)
                .get(`/users/${testUser.user_id}/characters`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)

            expect(
                response.body.some(character =>
                    character.character_id ===
                    testCharacter.character_id
                )
            ).toBe(true)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .get("/users/999999999/characters")

            expect(response.status).toBe(404)
        })
    })

    describe("GET /users/:id/characters/:name", () => {
        test("returns the requested character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(response.status).toBe(200)
            expect(response.body.character_id)
                .toBe(testCharacter.character_id)
            expect(response.body.name)
                .toBe(testCharacter.name)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )

            expect(response.status).toBe(404)
            expect(response.body.name).toBeUndefined()
        })
    })

    describe("POST /users/:id/characters", () => {
        test("creates another character for the user", async () => {
            const characterName =
                `TestCharacter_Additional_${Date.now()}`

            const response = await request(app)
                .post(`/users/${testUser.user_id}/characters`)
                .send({
                    name: characterName,
                    max_weight: 120
                })

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(characterName)
            expect(response.body.user_id)
                .toBe(testUser.user_id)
            expect(response.body.max_weight).toBe(120)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .post("/users/999999999/characters")
                .send({
                    name: `TestCharacter_Missing_${Date.now()}`,
                    max_weight: 100
                })

            expect(response.status).toBe(404)
        })

        test("returns 409 for a duplicate character name", async () => {
            const response = await request(app)
                .post(`/users/${testUser.user_id}/characters`)
                .send({
                    name: testCharacter.name,
                    max_weight: 100
                })

            expect(response.status).toBe(409)
        })
    })

    describe("PATCH /users/:id/characters/:name", () => {
        test("updates only the character name", async () => {
            const newName = `${testCharacter.name}_Updated`

            const patchResponse = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    name: newName
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.name).toBe(newName)
            expect(patchResponse.body.max_weight).toBe(100)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(newName)
                )

            expect(getResponse.status).toBe(200)
            expect(getResponse.body.name).toBe(newName)
            expect(getResponse.body.max_weight).toBe(100)
        })

        test("updates only max_weight", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    max_weight: 150
                })

            expect(response.status).toBe(200)
            expect(response.body.name)
                .toBe(testCharacter.name)
            expect(response.body.max_weight).toBe(150)
        })

        test("updates both name and max_weight", async () => {
            const newName = `${testCharacter.name}_Updated`

            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    name: newName,
                    max_weight: 175
                })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe(newName)
            expect(response.body.max_weight).toBe(175)
        })

        test("returns 400 when no fields are supplied", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({})

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "At least one field must be provided"
            )
        })

        test("returns 400 for an invalid max_weight", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    max_weight: 0
                })

            expect(response.status).toBe(400)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )
                .send({
                    max_weight: 150
                })

            expect(response.status).toBe(404)
        })
    })

    describe("DELETE /users/:id/characters/:name", () => {
        test("deletes an existing character", async () => {
            const deleteResponse = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(deleteResponse.status).toBe(200)
            expect(deleteResponse.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(getResponse.status).toBe(404)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })
    })

    // SQL inventory-route tests should be added here later
})
const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")


describe("Auth Routes", () => {
    let testUser
    let additionalUserIds

    const TEST_PASSWORD = "testpass"

    beforeEach(async () => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        additionalUserIds = []

        const userResponse = await request(app)
            .post("/users")
            .send({
                username: `AuthTestUser_${uniqueSuffix}`,
                email: `authtest_${uniqueSuffix}@example.com`,
                password: TEST_PASSWORD
            })

        expect(userResponse.status).toBe(201)

        testUser = userResponse.body
    })


    afterEach(() => {
        for (const userId of additionalUserIds) {
            db.prepare(`
                DELETE FROM users
                WHERE user_id = ?
            `).run(userId)
        }

        db.prepare(`
            DELETE FROM users
            WHERE user_id = ?
        `).run(testUser.user_id)
    })


    // --- POST /auth/login ---

    describe("POST /auth/login", () => {

        test("logs in with a valid email and password", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(200)

            expect(response.body.user_id)
                .toBe(testUser.user_id)

            expect(response.body.username)
                .toBe(testUser.username)

            expect(response.body.email)
                .toBe(testUser.email)
        })


        test("does not return the password or password hash", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(200)

            expect(response.body.password).toBeUndefined()
            expect(response.body.password_hash).toBeUndefined()
        })


        test("creates a session cookie after successful login", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(200)

            const cookies = response.headers["set-cookie"]

            expect(cookies).toBeDefined()
            expect(cookies.length).toBeGreaterThan(0)

            expect(
                cookies.some(cookie =>
                    cookie.startsWith("connect.sid=")
                )
            ).toBe(true)
        })


        test("sets the session cookie as HttpOnly", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(200)

            const cookies = response.headers["set-cookie"]

            expect(
                cookies.some(cookie =>
                    cookie.includes("HttpOnly")
                )
            ).toBe(true)
        })


        test("rejects a missing email", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(400)
        })


        test("rejects a missing password", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email
                })

            expect(response.status).toBe(400)
        })


        test("rejects an unknown email", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: "doesnotexist@example.com",
                    password: TEST_PASSWORD
                })

            expect(response.status).toBe(401)
        })


        test("rejects an incorrect password", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: "wrongpass"
                })

            expect(response.status).toBe(401)
        })

    })


    // --- GET /auth/me ---

    describe("GET /auth/me", () => {

        test("returns the authenticated user", async () => {
            const agent = request.agent(app)

            const loginResponse = await agent
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(loginResponse.status).toBe(200)

            const response = await agent
                .get("/auth/me")

            expect(response.status).toBe(200)

            expect(response.body.user_id)
                .toBe(testUser.user_id)

            expect(response.body.username)
                .toBe(testUser.username)

            expect(response.body.email)
                .toBe(testUser.email)
        })


        test("does not return the password or password hash", async () => {
            const agent = request.agent(app)

            await agent
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            const response = await agent
                .get("/auth/me")

            expect(response.status).toBe(200)

            expect(response.body.password).toBeUndefined()
            expect(response.body.password_hash).toBeUndefined()
        })


        test("rejects an unauthenticated request", async () => {
            const response = await request(app)
                .get("/auth/me")

            expect(response.status).toBe(401)

            expect(response.body.error).toBe(
                "Not authenticated"
            )
        })

    })


    // --- POST /auth/logout ---

    describe("POST /auth/logout", () => {

        test("logs out an authenticated user", async () => {
            const agent = request.agent(app)

            const loginResponse = await agent
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(loginResponse.status).toBe(200)

            const response = await agent
                .post("/auth/logout")

            expect(response.status).toBe(200)

            expect(response.body.message).toBe(
                "Logged out successfully"
            )
        })


        test("clears the session cookie after logout", async () => {
            const agent = request.agent(app)

            await agent
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            const response = await agent
                .post("/auth/logout")

            expect(response.status).toBe(200)

            const cookies = response.headers["set-cookie"]

            expect(cookies).toBeDefined()

            expect(
                cookies.some(cookie =>
                    cookie.startsWith("connect.sid=")
                )
            ).toBe(true)
        })


        test("session can no longer access protected routes after logout", async () => {
            const agent = request.agent(app)

            const loginResponse = await agent
                .post("/auth/login")
                .send({
                    email: testUser.email,
                    password: TEST_PASSWORD
                })

            expect(loginResponse.status).toBe(200)

            const beforeLogout = await agent
                .get("/auth/me")

            expect(beforeLogout.status).toBe(200)

            const logoutResponse = await agent
                .post("/auth/logout")

            expect(logoutResponse.status).toBe(200)

            const afterLogout = await agent
                .get("/auth/me")

            expect(afterLogout.status).toBe(401)

            expect(afterLogout.body.error).toBe(
                "Not authenticated"
            )
        })

    })

})
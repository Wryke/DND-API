const request = require("supertest");
const app = require("../app");

describe("item routes", () => {
    test("GET /items/equipment returns an array", async () => {
        const response = await request(app).get("/items/equipment");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test("GET /items/equipment/backpack returns backpack", async () => {
        const response = await request(app).get("/items/equipment/backpack");

        expect(response.status).toBe(200);
        expect(response.body.index).toBe("backpack");
    });
});
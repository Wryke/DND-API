const { findItemByIndex } = require("./itemQueries");

const request = require("supertest")
const db = require("./connection");

const item = findItemByIndex("backpack");

describe("Database Item Quieres", () => {
    // GET /items/equipment
    test("findItemByIndex with arg 'backpack' returns backpack", () => {
        const item = findItemByIndex("backpack")
        expect(item.item_index).toBe("backpack")
    })
})
const {
    findUser,
    findCharacter
} = require("./userHelpers.js")

describe("User helper functions", () => {

    const users = [
        {
            id: "1",
            username: "Joe",
            characters: [
                {
                    character_name: "Grung",
                    inventories: []
                }
            ]
        },
        {
            id: "2",
            username: "Tim",
            characters: [
                {
                    character_name: "Sir Killsalot",
                    inventories: []
                }
            ]
        }
    ]

    test("findUser returns the user with matching id", () => {
        const user = findUser(users, "1")

        expect(user.username).toBe("Joe")
    })

    test("findUser returns undefined when user is not found", () => {
        const user = findUser(users, "999")

        expect(user).toBeUndefined()
    })

    test("findCharacter returns matching character", () => {
        const user = findUser(users, "1")

        const character = findCharacter(user, "Grung")

        expect(character.character_name).toBe("Grung")
    })
})
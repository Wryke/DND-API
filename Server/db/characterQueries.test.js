
const {
    createUser,
    deleteUserById
} = require("./userQueries")

const {
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById,
    findAllClasses,
    findSubclassByClassId,
    findCharacterClasses,
    findAllSpecies,
    findAllBackgrounds,
    findCharacterProficiencies,
    findSkills,
    findCharacterSkills,
    findAllWeaponMasteries,
    findCharacterWeaponMasteries
} = require("./characterQueries")

// Integration tests: use a dedicated SQLite test database.
describe("Database Character Queries", () => {
    let testUser
    let testCharacter
    let additionalUserIds = []

    beforeEach(() => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        testUser = createUser({
            username: `TestUser_${uniqueSuffix}`,
            email: `test_${uniqueSuffix}@example.com`,
            passwordHash: `test-hash-${uniqueSuffix}`
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `TestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        additionalUserIds = []
    })

    afterEach(() => {
        deleteUserById(testUser.user_id)

        for (const userId of additionalUserIds) {
            deleteUserById(userId)
        }
    })

    describe("findCharactersByUserId", () => {
        test("returns the user's characters", () => {
            const characters =
                findCharactersByUserId(testUser.user_id)

            expect(Array.isArray(characters)).toBe(true)

            expect(
                characters.some(character =>
                    character.character_id ===
                    testCharacter.character_id
                )
            ).toBe(true)
        })

        test("returns standardized character data", () => {
            const characters =
                findCharactersByUserId(testUser.user_id)

            const character = characters.find(character =>
                character.character_id ===
                testCharacter.character_id
            )

            expect(character).toHaveProperty("character_id")
            expect(character).toHaveProperty("user_id")
            expect(character).toHaveProperty("name")
            expect(character).toHaveProperty("max_weight")
        })

        test("returns characters ordered by name", () => {
            createCharacter({
                user_id: testUser.user_id,
                name: "AAA Test Character",
                max_weight: 100
            })

            const characters =
                findCharactersByUserId(testUser.user_id)

            const names = characters.map(character => character.name)

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })

        test("returns an empty array for a user with no characters", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser = createUser({
                username: `EmptyUser_${uniqueSuffix}`,
                email: `empty_${uniqueSuffix}@example.com`,
                passwordHash: "test-hash"
            })

            additionalUserIds.push(additionalUser.user_id)

            const characters =
                findCharactersByUserId(additionalUser.user_id)

            expect(characters).toEqual([])
        })
    })

    describe("findCharacterByUserIdAndName", () => {
        test("returns an existing character", () => {
            const character = findCharacterByUserIdAndName(
                testUser.user_id,
                testCharacter.name
            )

            expect(character).toBeDefined()
            expect(character.character_id).toBe(testCharacter.character_id)
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.name).toBe(testCharacter.name)
            expect(character.max_weight).toBe(testCharacter.max_weight)
        })

        test("returns undefined for a missing character", () => {
            const character = findCharacterByUserIdAndName(
                testUser.user_id,
                "MissingCharacter"
            )

            expect(character).toBeUndefined()
        })

        test("does not return another user's character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser = createUser({
                username: `OtherUser_${uniqueSuffix}`,
                email: `other_${uniqueSuffix}@example.com`,
                passwordHash: "test-hash"
            })

            additionalUserIds.push(additionalUser.user_id)

            const character = findCharacterByUserIdAndName(
                additionalUser.user_id,
                testCharacter.name
            )

            expect(character).toBeUndefined()
        })
    })

    describe("createCharacter", () => {
        test("creates a character", () => {
            const character = createCharacter({
                user_id: testUser.user_id,
                name: `AdditionalCharacter_${Date.now()}`,
                max_weight: 120
            })

            expect(character).toHaveProperty("character_id")
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.max_weight).toBe(120)

            const storedCharacter = findCharacterByUserIdAndName(
                testUser.user_id,
                character.name
            )

            expect(storedCharacter).toBeDefined()
            expect(storedCharacter.character_id).toBe(character.character_id)
        })
    })

    describe("updateCharacterById", () => {
        test("updates an existing character", () => {
            const newName = `${testCharacter.name}_Updated`

            const result = updateCharacterById(
                testCharacter.character_id,
                {
                    name: newName,
                    max_weight: 150
                }
            )

            expect(result).toEqual({
                character_id: testCharacter.character_id,
                name: newName,
                max_weight: 150
            })

            const storedCharacter = findCharacterByUserIdAndName(
                testUser.user_id,
                newName
            )

            expect(storedCharacter).toBeDefined()
            expect(storedCharacter.max_weight).toBe(150)
        })

        test("returns undefined for a missing character", () => {
            const result = updateCharacterById(
                999999999,
                {
                    name: "MissingCharacter",
                    max_weight: 100
                }
            )

            expect(result).toBeUndefined()
        })
    })

    describe("deleteCharacterById", () => {
        test("deletes an existing character", () => {
            const deleted =
                deleteCharacterById(testCharacter.character_id)

            expect(deleted).toBe(true)

            expect(
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    testCharacter.name
                )
            ).toBeUndefined()
        })

        test("returns false for a missing character", () => {
            const deleted = deleteCharacterById(999999999)

            expect(deleted).toBe(false)
        })
    })
})


// Reference-data tests require referenceSeed.sql.
// Seeded-character tests additionally require the three characters from testValues.sql.
describe("Character Reference and Relationship Queries", () => {
    describe("findAllClasses", () => {
        test("returns all 12 classes alphabetically", () => {
            const classes = findAllClasses()
            expect(classes).toHaveLength(12)
            expect(classes.map(c => c.class_name)).toEqual(
                [...classes.map(c => c.class_name)].sort((a, b) => a.localeCompare(b))
            )
            expect(classes).toEqual(expect.arrayContaining([
                expect.objectContaining({ class_id: 5, class_name: "Fighter" }),
                expect.objectContaining({ class_id: 9, class_name: "Rogue" })
            ]))
        })
    })

    describe("findSubclassByClassId", () => {
        test("returns the four Fighter subclasses", () => {
            const subclasses = findSubclassByClassId(5)
            expect(subclasses).toHaveLength(4)
            expect(subclasses.every(s => s.class_id === 5)).toBe(true)
            expect(subclasses.map(s => s.subclass_name)).toContain("Champion")
        })

        test("returns an empty array for a nonexistent class", () => {
            expect(findSubclassByClassId(999999)).toEqual([])
        })
    })

    describe("findCharacterClasses", () => {
        test("returns seeded Fighter's class, subclass, and level", () => {
            expect(findCharacterClasses(1)).toEqual([
                expect.objectContaining({
                    character_id: 1,
                    class_id: 5,
                    class_name: "Fighter",
                    subclass_id: 18,
                    subclass_name: "Champion",
                    class_level: 3
                })
            ])
        })

        test("returns an empty array when no classes are assigned", () => {
            expect(findCharacterClasses(999999)).toEqual([])
        })
    })

    describe("findAllSpecies", () => {
        test("returns the ten seeded species", () => {
            const species = findAllSpecies()
            expect(species).toHaveLength(10)
            expect(species).toEqual(expect.arrayContaining([
                expect.objectContaining({ species_index: "human", species_name: "Human" })
            ]))
        })
    })

    describe("findAllBackgrounds", () => {
        test("returns the sixteen seeded backgrounds", () => {
            const backgrounds = findAllBackgrounds()
            expect(backgrounds).toHaveLength(16)
            expect(backgrounds).toEqual(expect.arrayContaining([
                expect.objectContaining({ background_index: "soldier", background_name: "Soldier" })
            ]))
        })
    })

    describe("findCharacterProficiencies", () => {
        test("returns Fighter's weapon and saving throw proficiencies", () => {
            const proficiencies = findCharacterProficiencies(1)
            expect(proficiencies).toHaveLength(3)
            expect(proficiencies.map(p => p.proficiency_index).sort()).toEqual([
                "martial-weapons", "saving-throw-con", "saving-throw-str"
            ])
            expect(proficiencies).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    proficiency_index: "saving-throw-str",
                    type_index: "saving-throw",
                    ability_index: "str"
                }),
                expect.objectContaining({
                    proficiency_index: "martial-weapons",
                    type_index: "weapon",
                    ability_index: null
                })
            ]))
        })

        test("returns no proficiencies for an unassigned character", () => {
            expect(findCharacterProficiencies(999999)).toEqual([])
        })
    })

    describe("findSkills", () => {
        test("returns all 18 skills with their abilities", () => {
            const skills = findSkills()
            expect(skills).toHaveLength(18)
            expect(skills).toEqual(expect.arrayContaining([
                expect.objectContaining({ skill_name: "Athletics", ability_index: "str" }),
                expect.objectContaining({ skill_name: "Stealth", ability_index: "dex" }),
                expect.objectContaining({ skill_name: "Persuasion", ability_index: "cha" })
            ]))
        })
    })

    describe("findCharacterSkills", () => {
        test("returns seeded Rogue's Stealth expertise", () => {
            expect(findCharacterSkills(3)).toEqual([
                expect.objectContaining({ character_id: 3, skill_id: 17, expertise: 1 })
            ])
        })

        test("returns no skills for an unassigned character", () => {
            expect(findCharacterSkills(999999)).toEqual([])
        })
    })

    describe("findAllWeaponMasteries", () => {
        test("returns all 38 weapon types and their mastery properties", () => {
            const weapons = findAllWeaponMasteries()
            expect(weapons).toHaveLength(38)
            expect(weapons).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    weapon_type_id: 22,
                    weapon_type_name: "Longsword",
                    weapon_category: "martial",
                    mastery_name: "Sap"
                }),
                expect.objectContaining({
                    weapon_type_id: 2,
                    weapon_type_name: "Dagger",
                    weapon_category: "simple",
                    mastery_name: "Nick"
                })
            ]))
        })
    })

    describe("findCharacterWeaponMasteries", () => {
        test("returns the seeded Fighter's Longsword mastery", () => {
            expect(findCharacterWeaponMasteries(1)).toEqual([
                expect.objectContaining({
                    character_id: 1,
                    weapon_type_id: 22,
                    weapon_type_name: "Longsword",
                    mastery_name: "Sap"
                })
            ])
        })

        test("returns no masteries for an unassigned character", () => {
            expect(findCharacterWeaponMasteries(999999)).toEqual([])
        })
    })
})

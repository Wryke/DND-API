const db = require("./connection")


// --- User Queries ---

const findUserByIdStmt = db.prepare(`
    SELECT user_id, username, email
    FROM users
    WHERE user_id = ?
`)

function findUserById (userId) {
    return findUserByIdStmt.get(userId)
}

const findUserByUsernameStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE username = ?
`)

function findUserByUsername (username) {
    return findUserByUsernameStmt.get(username)
}

const findPasswordHashByUserIdStmt = db.prepare(`
    SELECT password_hash
    FROM users
    WHERE user_id = ?
`)

function findPasswordHashByUserId(userId) {
    const result = findPasswordHashByUserIdStmt.get(userId)

    if (!result) {
        return undefined
    }

    return result.password_hash
}

const findUserByEmailStmt = db.prepare(`
    SELECT
        user_id,
        username,
        email,
        password_hash
    FROM users
    WHERE email = ?
`)

function findUserByEmail (email) {
    return findUserByEmailStmt.get(email)
}

const createUserStmt = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
`)

function createUser ({ username, email, passwordHash }) {
    const result = createUserStmt.run(username, email, passwordHash)

    return {
        user_id: result.lastInsertRowid,
        username,
        email
    }
}

const updateUserByIdStmt = db.prepare(`
    UPDATE users
    SET username = ?,
        email = ?,
        password_hash = ?
    WHERE user_id = ?
`)

function updateUserById(userId, { username, email, passwordHash }) {
    const result = updateUserByIdStmt.run(
        username,
        email,
        passwordHash,
        userId
    )

    if (result.changes === 0) {
        return undefined
    }

    return {
        user_id: userId,
        username,
        email
    }
}

const deleteUserByIdStmt = db.prepare(`
    DELETE FROM users
    WHERE user_id = ?
`)

function deleteUserById (userId) {
    const result = deleteUserByIdStmt.run(userId)
    return result.changes === 1
}

module.exports = {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    findPasswordHashByUserId,
    createUser,
    updateUserById,
    deleteUserById
}
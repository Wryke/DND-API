const { findItemByIndex } = require("./itemQueries");
const db = require("./connection");

const item = findItemByIndex("backpack");

console.log(item);

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table';
`).all();

console.log(tables);

const items = db.prepare(`
    SELECT *
    FROM items;
`).all();

console.log(items);
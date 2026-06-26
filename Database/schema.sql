PRAGMA foreign_keys = ON;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE characters (
    character_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    max_weight REAL NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (user_id, name)
);

CREATE TABLE items (
    item_id INTEGER PRIMARY KEY,
    item_index TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    item_category TEXT NOT NULL
);

CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    character_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    parent_inventory_id INTEGER,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (parent_inventory_id) REFERENCES inventory(inventory_id)
);
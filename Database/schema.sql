PRAGMA foreign_keys = ON;

-- Lookup Tables --

CREATE TABLE item_type_lookup (
    item_type_id INTEGER PRIMARY KEY,
    item_type_name TEXT NOT NULL UNIQUE
);

CREATE TABLE currency_lookup (
    currency_unit_id INTEGER PRIMARY KEY,
    currency_code TEXT NOT NULL UNIQUE,
    currency_name TEXT NOT NULL
);

CREATE TABLE damage_type_lookup (
    damage_type_id INTEGER PRIMARY KEY,
    damage_index TEXT NOT NULL UNIQUE,
    damage_name TEXT NOT NULL
);

CREATE TABLE ability_lookup (
    ability_score_id INTEGER PRIMARY KEY,
    ability_index TEXT NOT NULL UNIQUE,
    ability_name TEXT NOT NULL
);

CREATE TABLE weapon_mastery_lookup (
    mastery_id INTEGER PRIMARY KEY,
    mastery_index TEXT NOT NULL UNIQUE,
    mastery_name TEXT NOT NULL
);

CREATE TABLE weapon_property_lookup (
    property_id INTEGER PRIMARY KEY,
    property_index TEXT NOT NULL UNIQUE,
    property_name TEXT NOT NULL
);

CREATE TABLE categories_lookup (
    category_id INTEGER PRIMARY KEY,
    category_index TEXT NOT NULL UNIQUE,
    category_name TEXT NOT NULL
);

-- Core tables --

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

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    UNIQUE (user_id, name)
);

CREATE TABLE items (
    item_id INTEGER PRIMARY KEY,
    item_index TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    weight DECIMAL(10,2),
    cost_quantity INTEGER,
    currency_unit_id INTEGER,
    item_type_id INTEGER,

    FOREIGN KEY (currency_unit_id)
        REFERENCES currency_lookup(currency_unit_id),

    FOREIGN KEY (item_type_id)
        REFERENCES item_type_lookup(item_type_id)
);

CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    character_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    parent_inventory_id INTEGER,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    FOREIGN KEY (character_id)
        REFERENCES characters(character_id)
        ON DELETE CASCADE,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id),

    FOREIGN KEY (parent_inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE SET NULL
);

-- Bridge Tables --

CREATE TABLE item_to_category (
    item_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,

    PRIMARY KEY (item_id, category_id),

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories_lookup(category_id)
);

-- Type/Subtype Tables --

CREATE TABLE weapons (
    item_id INTEGER PRIMARY KEY,
    weapon_category TEXT NOT NULL,
    range_normal INTEGER,
    range_long INTEGER,
    throw_range_normal INTEGER,
    throw_range_long INTEGER,
    mastery_id INTEGER,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (mastery_id)
        REFERENCES weapon_mastery_lookup(mastery_id)
);

CREATE TABLE weapon_damage_components (
    damage_component_id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    damage_dice TEXT NOT NULL,
    damage_type_id INTEGER NOT NULL,
    damage_mode TEXT NOT NULL,

    FOREIGN KEY (item_id)
        REFERENCES weapons(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (damage_type_id)
        REFERENCES damage_type_lookup(damage_type_id)
);


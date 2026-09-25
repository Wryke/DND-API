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

CREATE TABLE equipment_slot_lookup (
    equipment_slot_id INTEGER PRIMARY KEY,
    equipment_slot_index TEXT NOT NULL UNIQUE,
    equipment_slot_name TEXT NOT NULL UNIQUE
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
    weight DECIMAL(10,2) CHECK (weight >= 0),
    cost_quantity INTEGER CHECK (cost_quantity >= 0),
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
        ON DELETE SET NULL,

    UNIQUE (character_id, inventory_id)
);

CREATE TABLE equipment (
    equipment_id INTEGER PRIMARY KEY,
    character_id INTEGER NOT NULL,
    inventory_id INTEGER NOT NULL,
    equipment_slot_id INTEGER NOT NULL,

    FOREIGN KEY (equipment_slot_id)
        REFERENCES equipment_slot_lookup(equipment_slot_id),

    FOREIGN KEY (character_id)
        REFERENCES characters(character_id)
        ON DELETE CASCADE,

    FOREIGN KEY (character_id, inventory_id)
        REFERENCES inventory(character_id, inventory_id)
        ON DELETE CASCADE,

    UNIQUE(character_id, equipment_slot_id)
);

-- Type Tables --

CREATE TABLE weapons (
    item_id INTEGER PRIMARY KEY,
    weapon_category TEXT NOT NULL,
    range_normal INTEGER CHECK (range_normal >= 0),
    range_long INTEGER CHECK (range_long >= 0),
    throw_range_normal INTEGER CHECK (throw_range_normal >= 0),
    throw_range_long INTEGER CHECK (throw_range_long >= 0),
    mastery_id INTEGER,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (mastery_id)
        REFERENCES weapon_mastery_lookup(mastery_id)
);

CREATE TABLE armor (
    item_id INTEGER PRIMARY KEY,
    armor_category TEXT NOT NULL,
    base_ac INTEGER NOT NULL CHECK (base_ac >= 0),
    dex_bonus BOOLEAN,
    max_bonus INTEGER CHECK (max_bonus >= 0),
    strength_minimum INTEGER,
    stealth_disadvantage BOOLEAN,
    don_time INTEGER CHECK (don_time > 0),
    don_time_unit TEXT,
    doff_time INTEGER CHECK (doff_time > 0),
    doff_time_unit TEXT,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

CREATE TABLE containers (
    item_id INTEGER PRIMARY KEY,
    max_volume TEXT,
    max_carry_weight INTEGER CHECK (max_carry_weight > 0),
    max_item_count INTEGER CHECK (max_item_count > 0),

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

CREATE TABLE ammunition (
    item_id INTEGER PRIMARY KEY,
    bundle_quantity INTEGER CHECK (bundle_quantity > 0),
    storage_item_id INTEGER,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (storage_item_id)
        REFERENCES items(item_id)
);

CREATE TABLE tools (
    item_id INTEGER PRIMARY KEY,
    ability_score_id INTEGER,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (ability_score_id)
        REFERENCES ability_lookup(ability_score_id)
);

CREATE TABLE equipment_packs (
    item_id INTEGER PRIMARY KEY,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- Subtype Tables --

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

CREATE TABLE tool_utilize (
    utilize_id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    ability_score_id INTEGER NOT NULL,
    dc_value INTEGER NOT NULL CHECK (dc_value >= 0),
    success_type TEXT NOT NULL,

    FOREIGN KEY (item_id)
        REFERENCES tools(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (ability_score_id)
        REFERENCES ability_lookup(ability_score_id)
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

CREATE TABLE weapon_to_property (
    item_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,

    PRIMARY KEY (item_id, property_id),

    FOREIGN KEY (item_id)
        REFERENCES weapons(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (property_id)
        REFERENCES weapon_property_lookup(property_id)
);

CREATE TABLE armor_to_resistance (
    item_id INTEGER NOT NULL,
    damage_type_id INTEGER NOT NULL,

    PRIMARY KEY (item_id, damage_type_id),

    FOREIGN KEY (item_id)
        REFERENCES armor(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (damage_type_id)
        REFERENCES damage_type_lookup(damage_type_id)
);

CREATE TABLE tool_craft (
    item_id INTEGER NOT NULL,
    crafted_item_id INTEGER NOT NULL,

    PRIMARY KEY (item_id, crafted_item_id),

    FOREIGN KEY (item_id)
        REFERENCES tools(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (crafted_item_id)
        REFERENCES items(item_id)
);

CREATE TABLE pack_contents (
    pack_item_id INTEGER NOT NULL,
    contained_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    PRIMARY KEY (pack_item_id, contained_item_id),

    FOREIGN KEY (pack_item_id)
        REFERENCES equipment_packs(item_id)
        ON DELETE CASCADE,

    FOREIGN KEY (contained_item_id)
        REFERENCES items(item_id)
);
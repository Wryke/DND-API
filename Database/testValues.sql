-- ============================================
-- Test Users
-- ============================================

INSERT INTO users (
    user_id,
    username,
    email,
    password_hash
)
VALUES
    (1, 'testUser', 'test@example.com', '$argon2id$v=19$m=65536,p=4,t=3$1H+hB3/gBS3Wqn5iGbz9ig$7hA23wGYPermRJNXReuYFYMULLgE91SnP/75Z0fGwGU');

-- Test account password: testpass

-- ============================================
-- Test Characters
-- ============================================

INSERT INTO characters (
    character_id,
    user_id,
    name,
    max_weight,
    species_id,
    background_id
)
VALUES
    (1, 1, 'Test Character 1', 100, 8, 15),  -- Human, Soldier
    (2, 1, 'Test Character 2', 500, 2, 11),  -- Dragonborn, Noble
    (3, 1, 'Test Character 3', 1000, 4, 4); -- Elf, Criminal

-- ============================================
-- Test Character Classes
-- ============================================

INSERT INTO character_to_class (
    character_id,
    class_id,
    subclass_id,
    class_level
)
VALUES
    (1, 5, 18, 3),  -- Fighter, Champion
    (2, 7, 25, 3),  -- Paladin, Oath of Devotion
    (3, 9, 33, 3);  -- Rogue, Thief

-- ============================================
-- Test Character Proficiencies
-- ============================================

INSERT INTO character_to_proficiency (
    character_id,
    proficiency_id
)
VALUES
    -- Fighter
    (1, 7),   -- Martial Weapons
    (1, 58),  -- Strength saving throws
    (1, 60),  -- Constitution saving throws

    -- Paladin
    (2, 7),   -- Martial Weapons
    (2, 58),  -- Strength saving throws
    (2, 62),  -- Wisdom saving throws

    -- Rogue
    (3, 6),   -- Simple Weapons
    (3, 59),  -- Dexterity saving throws
    (3, 61);  -- Intelligence saving throws

-- These are representative test assignments, not complete class rules.

-- ============================================
-- Test Character Skills
-- ============================================

INSERT INTO character_to_skill (
    character_id,
    skill_id,
    expertise
)
VALUES
    (1, 4, 0),   -- Fighter: Athletics
    (2, 14, 0),  -- Paladin: Persuasion
    (3, 17, 1);  -- Rogue: Stealth (Expertise)
    
-- ============================================
-- Test Character Weapon Masteries
-- ============================================

INSERT INTO character_to_weapon_mastery (
    character_id,
    weapon_type_id
)
VALUES
    (1, 22),  -- Longsword
    (2, 28),  -- Shortsword
    (3, 2);   -- Dagger

-- ============================================
-- Test Character Inventories
-- ============================================

INSERT INTO inventory (
    inventory_id,
    character_id,
    item_id,
    parent_inventory_id,
    quantity
)
VALUES
    -- Character 1
    (1, 1, 7, NULL, 1),     -- Backpack
    (2, 1, 97, NULL, 1),    -- Longsword
    (3, 1, 171, 1, 5),      -- Torches inside Backpack
    (4, 1, 136, 1, 3),      -- Rations inside Backpack
    (5, 1, 130, 1, 1),      -- Pouch inside Backpack
    (6, 1, 128, 5, 2),      -- Potions of Healing inside Pouch
    -- Character 2
    (7, 2, 7, NULL, 1),     -- Backpack
    (8, 2, 149, NULL, 1),   -- Shortsword
    (9, 2, 147, NULL, 1),   -- Shield
    (10, 2, 141, 7, 1),     -- Rope inside Backpack
    (11, 2, 178, 7, 1),     -- Waterskin inside Backpack
    -- Character 3
    (12, 3, 7, NULL, 1),    -- Backpack
    (13, 3, 48, NULL, 2),   -- Daggers
    (14, 3, 133, 12, 1),   -- Quiver inside Backpack
    (15, 3, 6, 14, 20),     -- Arrows inside Quiver
    (16, 3, 171, 12, 10);   -- Torches inside Backpack

-- ============================================
-- Test Character Equipment
-- ============================================

INSERT INTO equipment (
    equipment_id,
    character_id,
    inventory_id,
    equipment_slot_id
)
VALUES
    (1, 1, 2, 1),  -- Character 1: Longsword in Main Hand
    (2, 2, 8, 1),  -- Character 2: Shortsword in Main Hand
    (3, 2, 9, 2);  -- Character 2: Shield in Off Hand

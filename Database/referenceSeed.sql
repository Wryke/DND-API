
-- D&D 2024 Static Reference Data
-- Common species and backgrounds only
-- Run against an initialized, empty schema

-- ============================================
-- 2024 D&D Classes
-- ============================================

INSERT INTO class_lookup (
    class_id,
    class_index,
    class_name
)
VALUES
    (1, 'barbarian', 'Barbarian'),
    (2, 'bard', 'Bard'),
    (3, 'cleric', 'Cleric'),
    (4, 'druid', 'Druid'),
    (5, 'fighter', 'Fighter'),
    (6, 'monk', 'Monk'),
    (7, 'paladin', 'Paladin'),
    (8, 'ranger', 'Ranger'),
    (9, 'rogue', 'Rogue'),
    (10, 'sorcerer', 'Sorcerer'),
    (11, 'warlock', 'Warlock'),
    (12, 'wizard', 'Wizard');


-- ============================================
-- 2024 D&D Subclasses
-- ============================================

INSERT INTO subclass_lookup (
    subclass_id,
    class_id,
    subclass_index,
    subclass_name
)
VALUES
    -- Barbarian
    (1, 1, 'path-of-the-berserker', 'Path of the Berserker'),
    (2, 1, 'path-of-the-wild-heart', 'Path of the Wild Heart'),
    (3, 1, 'path-of-the-world-tree', 'Path of the World Tree'),
    (4, 1, 'path-of-the-zealot', 'Path of the Zealot'),
    -- Bard
    (5, 2, 'college-of-dance', 'College of Dance'),
    (6, 2, 'college-of-glamour', 'College of Glamour'),
    (7, 2, 'college-of-lore', 'College of Lore'),
    (8, 2, 'college-of-valor', 'College of Valor'),
    -- Cleric
    (9, 3, 'life-domain', 'Life Domain'),
    (10, 3, 'light-domain', 'Light Domain'),
    (11, 3, 'trickery-domain', 'Trickery Domain'),
    (12, 3, 'war-domain', 'War Domain'),
    -- Druid
    (13, 4, 'circle-of-the-land', 'Circle of the Land'),
    (14, 4, 'circle-of-the-moon', 'Circle of the Moon'),
    (15, 4, 'circle-of-the-sea', 'Circle of the Sea'),
    (16, 4, 'circle-of-stars', 'Circle of Stars'),
    -- Fighter
    (17, 5, 'battle-master', 'Battle Master'),
    (18, 5, 'champion', 'Champion'),
    (19, 5, 'eldritch-knight', 'Eldritch Knight'),
    (20, 5, 'psi-warrior', 'Psi Warrior'),
    -- Monk
    (21, 6, 'warrior-of-the-open-hand', 'Warrior of the Open Hand'),
    (22, 6, 'warrior-of-shadow', 'Warrior of Shadow'),
    (23, 6, 'warrior-of-the-elements', 'Warrior of the Elements'),
    (24, 6, 'warrior-of-mercy', 'Warrior of Mercy'),
    -- Paladin
    (25, 7, 'oath-of-devotion', 'Oath of Devotion'),
    (26, 7, 'oath-of-the-ancients', 'Oath of the Ancients'),
    (27, 7, 'oath-of-glory', 'Oath of Glory'),
    (28, 7, 'oath-of-vengeance', 'Oath of Vengeance'),
    -- Ranger
    (29, 8, 'hunter', 'Hunter'),
    (30, 8, 'beast-master', 'Beast Master'),
    (31, 8, 'gloom-stalker', 'Gloom Stalker'),
    (32, 8, 'fey-wanderer', 'Fey Wanderer'),
    -- Rogue
    (33, 9, 'thief', 'Thief'),
    (34, 9, 'assassin', 'Assassin'),
    (35, 9, 'arcane-trickster', 'Arcane Trickster'),
    (36, 9, 'soulknife', 'Soulknife'),
    -- Sorcerer
    (37, 10, 'draconic-sorcery', 'Draconic Sorcery'),
    (38, 10, 'wild-magic', 'Wild Magic'),
    (39, 10, 'aberrant-sorcery', 'Aberrant Sorcery'),
    (40, 10, 'clockwork-sorcery', 'Clockwork Sorcery'),
    -- Warlock
    (41, 11, 'fiend-patron', 'Fiend Patron'),
    (42, 11, 'archfey-patron', 'Archfey Patron'),
    (43, 11, 'great-old-one-patron', 'Great Old One Patron'),
    (44, 11, 'celestial-patron', 'Celestial Patron'),
    -- Wizard
    (45, 12, 'abjurer', 'Abjurer'),
    (46, 12, 'conjurer', 'Conjurer'),
    (47, 12, 'diviner', 'Diviner'),
    (48, 12, 'evoker', 'Evoker');


-- ============================================
-- 2024 D&D Common Species
-- ============================================

INSERT INTO species_lookup (
    species_id,
    species_index,
    species_name
)
VALUES
    (1, 'aasimar', 'Aasimar'),
    (2, 'dragonborn', 'Dragonborn'),
    (3, 'dwarf', 'Dwarf'),
    (4, 'elf', 'Elf'),
    (5, 'gnome', 'Gnome'),
    (6, 'goliath', 'Goliath'),
    (7, 'halfling', 'Halfling'),
    (8, 'human', 'Human'),
    (9, 'orc', 'Orc'),
    (10, 'tiefling', 'Tiefling');


-- ============================================
-- 2024 D&D Common Backgrounds
-- ============================================

INSERT INTO background_lookup (
    background_id,
    background_index,
    background_name
)
VALUES
    (1, 'acolyte', 'Acolyte'),
    (2, 'artisan', 'Artisan'),
    (3, 'charlatan', 'Charlatan'),
    (4, 'criminal', 'Criminal'),
    (5, 'entertainer', 'Entertainer'),
    (6, 'farmer', 'Farmer'),
    (7, 'guard', 'Guard'),
    (8, 'guide', 'Guide'),
    (9, 'hermit', 'Hermit'),
    (10, 'merchant', 'Merchant'),
    (11, 'noble', 'Noble'),
    (12, 'sage', 'Sage'),
    (13, 'sailor', 'Sailor'),
    (14, 'scribe', 'Scribe'),
    (15, 'soldier', 'Soldier'),
    (16, 'wayfarer', 'Wayfarer');


-- ============================================
-- Item Types
-- ============================================

INSERT INTO item_type_lookup (
    item_type_id,
    item_type_name
)
VALUES
    (1, 'weapon'),
    (2, 'armor'),
    (3, 'container'),
    (4, 'ammunition'),
    (5, 'tool'),
    (6, 'equipment_pack');


-- ============================================
-- Currencies
-- ============================================

INSERT INTO currency_lookup (
    currency_unit_id,
    currency_code,
    currency_name
)
VALUES
    (1, 'cp', 'Copper Piece'),
    (2, 'sp', 'Silver Piece'),
    (3, 'ep', 'Electrum Piece'),
    (4, 'gp', 'Gold Piece'),
    (5, 'pp', 'Platinum Piece');


-- ============================================
-- Damage Types
-- ============================================

INSERT INTO damage_type_lookup (
    damage_type_id,
    damage_index,
    damage_name
)
VALUES
    (1, 'acid', 'Acid'),
    (2, 'bludgeoning', 'Bludgeoning'),
    (3, 'cold', 'Cold'),
    (4, 'fire', 'Fire'),
    (5, 'force', 'Force'),
    (6, 'lightning', 'Lightning'),
    (7, 'necrotic', 'Necrotic'),
    (8, 'piercing', 'Piercing'),
    (9, 'poison', 'Poison'),
    (10, 'psychic', 'Psychic'),
    (11, 'radiant', 'Radiant'),
    (12, 'slashing', 'Slashing'),
    (13, 'thunder', 'Thunder');


-- ============================================
-- Weapon Properties
-- ============================================

INSERT INTO weapon_property_lookup (
    property_id,
    property_index,
    property_name
)
VALUES
    (1, 'ammunition', 'Ammunition'),
    (2, 'finesse', 'Finesse'),
    (3, 'heavy', 'Heavy'),
    (4, 'light', 'Light'),
    (5, 'loading', 'Loading'),
    (6, 'range', 'Range'),
    (7, 'reach', 'Reach'),
    (8, 'thrown', 'Thrown'),
    (9, 'two-handed', 'Two-Handed'),
    (10, 'versatile', 'Versatile');


-- ============================================
-- Weapon Masteries
-- ============================================

INSERT INTO weapon_mastery_lookup (
    mastery_id,
    mastery_index,
    mastery_name
)
VALUES
    (1, 'cleave', 'Cleave'),
    (2, 'graze', 'Graze'),
    (3, 'nick', 'Nick'),
    (4, 'push', 'Push'),
    (5, 'sap', 'Sap'),
    (6, 'slow', 'Slow'),
    (7, 'topple', 'Topple'),
    (8, 'vex', 'Vex');


-- ============================================
-- 2024 Weapon Types
-- ============================================

INSERT INTO weapon_type_lookup (
    weapon_type_id,
    weapon_type_index,
    weapon_type_name,
    weapon_category,
    mastery_id
)
VALUES
    (1, 'club', 'Club', 'simple', 6),
    (2, 'dagger', 'Dagger', 'simple', 3),
    (3, 'greatclub', 'Greatclub', 'simple', 4),
    (4, 'handaxe', 'Handaxe', 'simple', 8),
    (5, 'javelin', 'Javelin', 'simple', 6),
    (6, 'light-hammer', 'Light Hammer', 'simple', 3),
    (7, 'mace', 'Mace', 'simple', 5),
    (8, 'quarterstaff', 'Quarterstaff', 'simple', 7),
    (9, 'sickle', 'Sickle', 'simple', 3),
    (10, 'spear', 'Spear', 'simple', 5),
    (11, 'dart', 'Dart', 'simple', 8),
    (12, 'light-crossbow', 'Light Crossbow', 'simple', 6),
    (13, 'shortbow', 'Shortbow', 'simple', 8),
    (14, 'sling', 'Sling', 'simple', 6),
    (15, 'battleaxe', 'Battleaxe', 'martial', 7),
    (16, 'flail', 'Flail', 'martial', 5),
    (17, 'glaive', 'Glaive', 'martial', 2),
    (18, 'greataxe', 'Greataxe', 'martial', 1),
    (19, 'greatsword', 'Greatsword', 'martial', 2),
    (20, 'halberd', 'Halberd', 'martial', 1),
    (21, 'lance', 'Lance', 'martial', 7),
    (22, 'longsword', 'Longsword', 'martial', 5),
    (23, 'maul', 'Maul', 'martial', 7),
    (24, 'morningstar', 'Morningstar', 'martial', 5),
    (25, 'pike', 'Pike', 'martial', 4),
    (26, 'rapier', 'Rapier', 'martial', 8),
    (27, 'scimitar', 'Scimitar', 'martial', 3),
    (28, 'shortsword', 'Shortsword', 'martial', 8),
    (29, 'trident', 'Trident', 'martial', 7),
    (30, 'warhammer', 'Warhammer', 'martial', 4),
    (31, 'war-pick', 'War Pick', 'martial', 5),
    (32, 'whip', 'Whip', 'martial', 6),
    (33, 'blowgun', 'Blowgun', 'martial', 8),
    (34, 'hand-crossbow', 'Hand Crossbow', 'martial', 8),
    (35, 'heavy-crossbow', 'Heavy Crossbow', 'martial', 4),
    (36, 'longbow', 'Longbow', 'martial', 6),
    (37, 'musket', 'Musket', 'martial', 6),
    (38, 'pistol', 'Pistol', 'martial', 8);


-- ============================================
-- Ability Scores
-- ============================================

INSERT INTO ability_lookup (
    ability_score_id,
    ability_index,
    ability_name
)
VALUES
    (1, 'str', 'STR'),
    (2, 'dex', 'DEX'),
    (3, 'con', 'CON'),
    (4, 'int', 'INT'),
    (5, 'wis', 'WIS'),
    (6, 'cha', 'CHA');


-- ============================================
-- Equipment Slots
-- ============================================

INSERT INTO equipment_slot_lookup (
    equipment_slot_id,
    equipment_slot_index,
    equipment_slot_name
)
VALUES
    (1, 'main_hand', 'Main Hand'),
    (2, 'off_hand', 'Off Hand'),
    (3, 'head', 'Head'),
    (4, 'body', 'Body'),
    (5, 'hands', 'Hands'),
    (6, 'feet', 'Feet'),
    (7, 'belt', 'Belt'),
    (8, 'amulet', 'Amulet'),
    (9, 'ring_1', 'Ring 1'),
    (10, 'ring_2', 'Ring 2'),
    (11, 'cosmetic', 'Cosmetic');


-- ============================================
-- Proficiency Types
-- ============================================

-- Original type IDs retained to avoid changing existing references.
-- Skills now live in skill_lookup; language is reserved for future use.
INSERT INTO proficiency_type_lookup (
    proficiency_type_id,
    type_index,
    type_name
)
VALUES
    (2, 'saving-throw', 'Saving Throw'),
    (3, 'weapon', 'Weapon'),
    (4, 'armor', 'Armor'),
    (5, 'tool', 'Tool'),
    (6, 'language', 'Language');


-- ============================================
-- Proficiencies (excluding skills and individual weapon types)
-- ============================================

-- Original IDs retained for existing proficiency relationships.
INSERT INTO proficiency_lookup (
    proficiency_id,
    proficiency_type_id,
    proficiency_index,
    proficiency_name,
    ability_score_id
)
VALUES
    (1, 4, 'light-armor', 'Light Armor', NULL),
    (2, 4, 'medium-armor', 'Medium Armor', NULL),
    (3, 4, 'heavy-armor', 'Heavy Armor', NULL),
    (5, 4, 'shields', 'Shields', NULL),
    (6, 3, 'simple-weapons', 'Simple Weapons', NULL),
    (7, 3, 'martial-weapons', 'Martial Weapons', NULL),
    (32, 5, 'alchemists-supplies', 'Alchemist''s Supplies', NULL),
    (33, 5, 'brewers-supplies', 'Brewer''s Supplies', NULL),
    (34, 5, 'tool-calligraphers-supplies', 'Calligrapher''s Supplies', NULL),
    (35, 5, 'carpenters-tools', 'Carpenter''s Tools', NULL),
    (36, 5, 'cartographers-tools', 'Cartographer''s Tools', NULL),
    (37, 5, 'cobblers-tools', 'Cobbler''s Tools', NULL),
    (38, 5, 'cooks-utensils', 'Cook''s Utensils', NULL),
    (39, 5, 'glassblowers-tools', 'Glassblower''s Tools', NULL),
    (40, 5, 'jewelers-tools', 'Jeweler''s Tools', NULL),
    (41, 5, 'leatherworkers-tools', 'Leatherworker''s Tools', NULL),
    (42, 5, 'masons-tools', 'Mason''s Tools', NULL),
    (43, 5, 'painters-supplies', 'Painter''s Supplies', NULL),
    (44, 5, 'potters-tools', 'Potter''s Tools', NULL),
    (45, 5, 'smiths-tools', 'Smith''s Tools', NULL),
    (46, 5, 'tinkers-tools', 'Tinker''s Tools', NULL),
    (47, 5, 'weavers-tools', 'Weaver''s Tools', NULL),
    (48, 5, 'woodcarvers-tools', 'Woodcarver''s Tools', NULL),
    (49, 5, 'disguise-kit', 'Disguise Kit', NULL),
    (50, 5, 'forgery-kit', 'Forgery Kit', NULL),
    (51, 5, 'tool-dice', 'Dice', NULL),
    (52, 5, 'tool-dragonchess', 'Dragonchess', NULL),
    (53, 5, 'tool-playing-cards', 'Playing Cards', NULL),
    (54, 5, 'tool-navigators-tools', 'Navigator''s Tools', NULL),
    (55, 5, 'tool-poisoners-kit', 'Poisoner''s Kit', NULL),
    (56, 5, 'tool-thieves-tools', 'Thieves'' Tools', NULL),
    (57, 5, 'tool-three-dragon-ante', 'Three-Dragon Ante', NULL),
    (58, 2, 'saving-throw-str', 'Saving Throw: STR', 1),
    (59, 2, 'saving-throw-dex', 'Saving Throw: DEX', 2),
    (60, 2, 'saving-throw-con', 'Saving Throw: CON', 3),
    (61, 2, 'saving-throw-int', 'Saving Throw: INT', 4),
    (62, 2, 'saving-throw-wis', 'Saving Throw: WIS', 5),
    (63, 2, 'saving-throw-cha', 'Saving Throw: CHA', 6),
    (64, 5, 'bagpipes', 'Bagpipes', NULL),
    (65, 5, 'drum', 'Drum', NULL),
    (66, 5, 'dulcimer', 'Dulcimer', NULL),
    (67, 5, 'flute', 'Flute', NULL),
    (68, 5, 'lute', 'Lute', NULL),
    (69, 5, 'lyre', 'Lyre', NULL),
    (70, 5, 'horn', 'Horn', NULL),
    (71, 5, 'pan-flute', 'Pan flute', NULL),
    (72, 5, 'shawm', 'Shawm', NULL),
    (73, 5, 'viol', 'Viol', NULL),
    (74, 5, 'herbalism-kit', 'Herbalism Kit', NULL);


-- ============================================
-- Skills
-- ============================================

INSERT INTO skill_lookup (
    skill_id,
    skill_index,
    skill_name,
    ability_score_id
)
VALUES
    (1, 'acrobatics', 'Acrobatics', 2),
    (2, 'animal-handling', 'Animal Handling', 5),
    (3, 'arcana', 'Arcana', 4),
    (4, 'athletics', 'Athletics', 1),
    (5, 'deception', 'Deception', 6),
    (6, 'history', 'History', 4),
    (7, 'insight', 'Insight', 5),
    (8, 'intimidation', 'Intimidation', 6),
    (9, 'investigation', 'Investigation', 4),
    (10, 'medicine', 'Medicine', 5),
    (11, 'nature', 'Nature', 4),
    (12, 'perception', 'Perception', 5),
    (13, 'performance', 'Performance', 6),
    (14, 'persuasion', 'Persuasion', 6),
    (15, 'religion', 'Religion', 4),
    (16, 'sleight-of-hand', 'Sleight of Hand', 2),
    (17, 'stealth', 'Stealth', 2),
    (18, 'survival', 'Survival', 5);
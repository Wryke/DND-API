-- Static Lookup Tables --

-- Database Item Types
INSERT INTO item_type_lookup (
    item_type_id,
    item_type_name
)

VALUES
    (         
        1,
        'weapon'
    ),
    (
        2,
        'armor'
    ),
    (
        3,
        'container'
    ),
    (
        4,
        'ammunition'
    ),
    (
        5,
        'tool'
    ),
    (
        6,
        'equipment_pack'
    );

-- Currency Types
INSERT INTO currency_lookup (
    currency_unit_id,
    currency_code,
    currency_name
)

VALUES
    (
        1,
        'cp',
        'Copper Piece'
    ),
    (
        2,
        'sp',
        'Silver Piece'
    ),
    (
        3,
        'ep',
        'Electrum Piece'
    ),
    (
        4,
        'gp',
        'Gold Piece'
    ),
    (
        5,
        'pp',
        'Platinum Piece'
    );

-- Damage Types
INSERT INTO damage_type_lookup (
    damage_type_id,
    damage_index,
    damage_name
)

VALUES
    (
        1,
        'acid',
        'Acid'
    ),
    (
        2,
        'bludgeoning',
        'Bludgeoning'
    ),
    (
        3,
        'cold',
        'Cold'
    ),
    (
        4,
        'fire',
        'Fire'
    ),
    (
        5,
        'force',
        'Force'
    ),
    (
        6,
        'lightning',
        'Lightning'
    ),
    (
        7,
        'necrotic',
        'Necrotic'
    ),
    (
        8,
        'piercing',
        'Piercing'
    ),
    (
        9,
        'poison',
        'Poison'
    ),
    (
        10,
        'psychic',
        'Psychic'
    ),
    (
        11,
        'radiant',
        'Radiant'
    ),
    (
        12,
        'slashing',
        'Slashing'
    ),
    (
        13,
        'thunder',
        'Thunder'
    );

-- Weapon Property Types
INSERT INTO weapon_property_lookup (
    property_id,
    property_index,
    property_name
)

VALUES 
    (
        1,
        'ammunition',
        'Ammunition'
    ),
    (
        2,
        'finesse',
        'Finesse'
    ),
    (
        3,
        'heavy',
        'Heavy'
    ),
    (
        4,
        'light',
        'Light'
    ),
    (
        5,
        'loading',
        'Loading'
    ),
    (
        6,
        'range',
        'Range'
    ),
    (
        7,
        'reach',
        'Reach'
    ),
    (
        8,
        'thrown',
        'Thrown'
    ),
    (
        9,
        'two-handed',
        'Two-Handed'
    ),
    (
        10,
        'versatile',
        'Versatile'
    );

-- Weapon Mastery Types
INSERT INTO weapon_mastery_lookup (
    mastery_id,
    mastery_index,
    mastery_name
)

VALUES 
    (
        1,
        'cleave',
        'Cleave'
    ),
    (
        2,
        'graze',
        'Graze'
    ),
    (
        3,
        'nick',
        'Nick'
    ),
    (
        4,
        'push',
        'Push'
    ),
    (
        5,
        'sap',
        'Sap'
    ),
    (
        6,
        'slow',
        'Slow'
    ),
    (
        7,
        'topple',
        'Topple'
    ),
    (
        8,
        'vex',
        'Vex'
    );

-- Ability Types
INSERT INTO ability_lookup (
    ability_score_id,
    ability_index,
    ability_name
)

VALUES
    (
        1,
        'str',
        'STR'
    ),
    (
        2,
        'dex',
        'DEX'
    ),
    (
        3,
        'con',
        'CON'
    ),
    (
        4,
        'int',
        'INT'
    ),
    (
        5,
        'wis',
        'WIS'
    ),
    (
        6,
        'cha',
        'CHA'
    );

-- Equipment Slots
INSERT INTO equipment_slot_lookup (
    equipment_slot_id, 
    equipment_slot_name
) 

VALUES
    (
        1, 
        'head'
    ),
    (
        2, 
        'armor'
    ),
    (
        3, 
        'hands'
    ),
    (
        4, 
        'feet'
    ),
    (
        5, 
        'accessory_1'
    ),
    (
        6, 
        'accessory_2'
    ),
    (
        7, 
        'accessory_3'
    ),
    (
        8, 
        'accessory_4'
    ),
    (
        9, 
        'accessory_5'
    ),
    (
        10, 
        'main_hand'
    ),
    (
        11, 
        'off_hand'
    );
-- Test user and test characters --
INSERT INTO users (
    user_id,
    username,
    email,
    password_hash
)

VALUES
    (
        1,
        'testUser',
        'test@example.com',
        '$argon2id$v=19$m=65536,p=4,t=3$1H+hB3/gBS3Wqn5iGbz9ig$7hA23wGYPermRJNXReuYFYMULLgE91SnP/75Z0fGwGU'
    );
-- password = testpass

INSERT INTO characters (
    character_id,
    user_id,
    name,
    max_weight
)

VALUES
    (
        1,
        1,
        'Test Character 1',
        100
    ),
    (
        2,
        1,
        'Test Character 2',
        500
    ),
    (
        3,
        1,
        'Test Character 3',
        1000
    );

-- Test Character Inventories --

INSERT INTO inventory (
    inventory_id,
    character_id,
    item_id,
    parent_inventory_id,
    quantity
)

VALUES
    -- Test Character 1 --

    -- Backpack
    (
        1,
        1,
        7,
        NULL,
        1
    ),

    -- Longsword
    (
        2,
        1,
        97,
        NULL,
        1
    ),

    -- Torches inside Backpack
    (
        3,
        1,
        171,
        1,
        5
    ),

    -- Rations inside Backpack
    (
        4,
        1,
        136,
        1,
        3
    ),

    -- Pouch inside Backpack
    (
        5,
        1,
        130,
        1,
        1
    ),

    -- Potion of Healing inside Pouch
    (
        6,
        1,
        128,
        5,
        2
    ),


    -- Test Character 2 --

    -- Backpack
    (
        7,
        2,
        7,
        NULL,
        1
    ),

    -- Shortsword
    (
        8,
        2,
        149,
        NULL,
        1
    ),

    -- Shield
    (
        9,
        2,
        147,
        NULL,
        1
    ),

    -- Rope inside Backpack
    (
        10,
        2,
        141,
        7,
        1
    ),

    -- Waterskin inside Backpack
    (
        11,
        2,
        178,
        7,
        1
    ),


    -- Test Character 3 --

    -- Backpack
    (
        12,
        3,
        7,
        NULL,
        1
    ),

    -- Dagger
    (
        13,
        3,
        48,
        NULL,
        2
    ),

    -- Quiver inside Backpack
    (
        14,
        3,
        133,
        12,
        1
    ),

    -- Arrows inside Quiver
    (
        15,
        3,
        6,
        14,
        20
    ),

    -- Torches inside Backpack
    (
        16,
        3,
        171,
        12,
        10
    );

-- Test Character Equipment --

INSERT INTO equipment (
    equipment_id,
    character_id,
    inventory_id,
    equipment_slot_id
)

VALUES
    -- Test Character 1: Longsword -> Main Hand
    (
        1,
        1,
        2,
        1
    ),

    -- Test Character 2: Shortsword -> Main Hand
    (
        2,
        2,
        8,
        1
    ),

    -- Test Character 2: Shield -> Off Hand
    (
        3,
        2,
        9,
        2
    );
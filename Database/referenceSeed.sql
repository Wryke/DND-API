-- Static Lookup Tables --

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
    )
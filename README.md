# D&D Character & Inventory Manager

A full-stack web application for managing tabletop RPG characters,
inventories, and equipped items. Built as a learning-driven project, it
combines a React client, a Node.js/Express API, and a relational SQLite
database.

> **Project status:** Active development (V3 frontend). The core
> account, character, inventory, and equipment workflows are being
> developed incrementally. The application is not yet a complete digital
> D&D character sheet.

## Features

### Accounts

-   Register and sign in with an account.
-   Session-based authentication and protected API routes.
-   Update account details and delete an account.
-   Store password hashes rather than plaintext passwords.

### Characters

-   Create characters with a name and maximum carrying weight.
-   View and select characters.
-   Edit and delete characters, including deletion confirmation.
-   Responsive character cards with a visual selected state.
-   Character editing through a reusable modal.

### Inventory and equipment

-   Associate inventory entries with a specific character.
-   Track quantities and support nested containers through parent
    inventory references.
-   Store item metadata, including weight, cost, and item type.
-   Associate inventory entries with equipment slots.
-   Support item-specific reference data for weapons, armor, tools,
    ammunition, containers, and equipment packs in the database.

> Some equipment and inventory improvements remain planned, including
> clearer equipped-item indicators, improved weight accounting, and
> equipping individual units from stacks.

## Technology stack

  Layer               Technology
  ------------------- --------------------------------------------
  Frontend            React, Vite, JavaScript, CSS
  Backend             Node.js, Express
  Database            SQLite, `better-sqlite3`
  Authentication      `express-session`, Argon2 password hashing
  API communication   Fetch API with session cookies

## Database schema

The diagram below documents the project's database evolution across its
V1, V2, and V3 designs.

![D&D database schema diagram](docs/schemaDiagram.jpg)

**Note:** This diagram is a historical/design overview, not a guaranteed
exact snapshot of the current database. The SQL schema is the source of
truth for column definitions and constraints. For example, the current
`users` table has `email` and `password_hash` fields, while the
diagram's V1 account section shows an earlier design.

### Key relationships

-   **Users → Characters:** One user can own multiple characters.
    Deleting a user cascades to their characters.
-   **Characters → Inventory:** Each inventory entry belongs to a
    character. Entries can refer to a parent inventory entry to
    represent items inside containers.
-   **Inventory → Items:** Inventory entries reference shared item
    definitions and store character-specific quantities.
-   **Inventory → Equipment:** Equipment records link character-owned
    inventory entries to equipment slots.
-   **Items → Item details:** Reference and subtype tables describe item
    categories and specialized properties such as weapon damage, armor,
    tools, and pack contents.

The SQL schema also defines foreign keys, uniqueness constraints, and
checks to help maintain data integrity.

## Project organization

``` text
.
├── Client/
│   └── src/
│       ├── api/           # Frontend API helpers and requests
│       ├── components/    # Shared and feature-specific UI components
│       ├── pages/         # Page-level React components
│       ├── styles/        # CSS stylesheets
│       └── App.jsx        # Main application state and page coordination
├── Server/
│   ├── db/                # SQLite connection and query functions
│   ├── routes/            # Express API routes
│   └── ...
├── Database/              # SQLite database and schema resources
└── docs/
    └── database-schema.png
```

*This is a conceptual overview of the main folders; exact filenames may
vary as the project is reorganized.*

## Running locally

**Prerequisites:** Node.js and npm. SQLite's command-line client is
useful for inspecting or migrating the database.

1.  Clone the repository.

2.  Install the server dependencies in `Server/` and client dependencies
    in `Client/` (or follow the repository's package layout if
    dependencies are managed at the root).

3.  Configure the server's database path and session settings according
    to its local configuration.

4.  Start the Express server using the script defined in its
    `package.json`.

5.  Start the Vite client from `Client/`:

    ``` bash
    npm install
    npm run dev
    ```

6.  Open the local URL printed by Vite.

**Setup note:** The server startup command, port, environment variable
names, and database initialization process should be documented once the
corresponding configuration files are finalized. Avoid committing
secrets, session credentials, or a database containing real user
information.

## Development roadmap

-   [x] Account registration, login, logout, and account management
-   [x] Character creation, selection, editing, and deletion
-   [x] Character card styling and edit modal
-   [ ] Extend characters with species, class, and level
-   [ ] Add six ability scores and eventually derived D&D statistics
-   [ ] Improve inventory/equipment interactions and weight calculations
-   [ ] Expand frontend validation, error handling, and automated tests
-   [ ] Continue responsive design and accessibility improvements
-   [ ] Explore character-sheet creation and PDF import/export

## Design goals

-   **Clear separation of concerns:** Keep React presentation, API
    routes, database queries, and persistence distinct.
-   **Relational integrity:** Use SQLite keys and constraints to protect
    character, inventory, and equipment relationships.
-   **Incremental development:** Add features in small, testable steps
    without disrupting existing workflows.
-   **Extensibility:** Leave room for richer D&D character data and
    future rules-based calculations.

## License

No license has been specified yet.

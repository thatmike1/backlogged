import { getDb } from "./index.js";

/**
 * migrate database to add 'skipped' status option
 */
function migrate(): void {
  console.log("Migrating database to add 'skipped' status...");

  const db = getDb();

  db.exec(`
    -- create new table with updated constraint
    CREATE TABLE library_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('backlog', 'playing', 'played', 'dropped', 'wishlist', 'skipped')),
      user_rating REAL CHECK (user_rating >= 1 AND user_rating <= 10),
      notes TEXT,
      hours_played REAL,
      completed_at TEXT,
      started_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(game_id)
    );

    -- copy data
    INSERT INTO library_new SELECT * FROM library;

    -- drop old table
    DROP TABLE library;

    -- rename new table
    ALTER TABLE library_new RENAME TO library;

    -- recreate index
    CREATE INDEX idx_library_status ON library(status);
    CREATE INDEX idx_library_user_rating ON library(user_rating);
  `);

  db.close();
  console.log("Migration complete!");
}

migrate();

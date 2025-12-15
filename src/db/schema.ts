/**
 * SQLite schema definitions for backlogged
 */

export const schema = `
-- games table: cached game data from IGDB
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  igdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  storyline TEXT,
  cover_url TEXT,
  release_date INTEGER,
  rating REAL,
  rating_count INTEGER,
  genres TEXT DEFAULT '[]',
  themes TEXT DEFAULT '[]',
  platforms TEXT DEFAULT '[]',
  game_modes TEXT DEFAULT '[]',
  similar_games TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- library table: user's game collection
CREATE TABLE IF NOT EXISTS library (
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

-- categories table: custom tags/lists
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- game_categories table: many-to-many relationship
CREATE TABLE IF NOT EXISTS game_categories (
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, category_id)
);

-- recommendation_log table: track AI suggestions
CREATE TABLE IF NOT EXISTS recommendation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  recommended_at TEXT DEFAULT CURRENT_TIMESTAMP,
  context TEXT,
  response TEXT CHECK (response IN ('accepted', 'rejected', 'played', 'maybe_later')),
  responded_at TEXT
);

-- indexes for common queries
CREATE INDEX IF NOT EXISTS idx_games_igdb_id ON games(igdb_id);
CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_library_status ON library(status);
CREATE INDEX IF NOT EXISTS idx_library_user_rating ON library(user_rating);
CREATE INDEX IF NOT EXISTS idx_recommendation_log_game_id ON recommendation_log(game_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_log_response ON recommendation_log(response);
`;

/**
 * default categories to seed the database with
 */
export const defaultCategories = [
  {
    name: "favorites",
    description: "All-time favorite games",
    color: "#f59e0b",
  },
  {
    name: "short-games",
    description: "Games under 10 hours",
    color: "#10b981",
  },
  {
    name: "chill",
    description: "Relaxing, low-stress games",
    color: "#6366f1",
  },
  {
    name: "multiplayer",
    description: "Games to play with friends",
    color: "#ec4899",
  },
  { name: "replay", description: "Worth playing again", color: "#8b5cf6" },
];

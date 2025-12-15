import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type {
  Game,
  LibraryEntry,
  LibraryEntryWithGame,
  Category,
  RecommendationLog,
  GameStatus,
  RecommendationResponse,
  LibraryFilters,
} from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");
const DB_PATH = join(DATA_DIR, "backlogged.db");

/**
 * ensure data directory exists
 */
function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * get database connection
 */
export function getDb(): Database.Database {
  ensureDataDir();
  return new Database(DB_PATH);
}

/**
 * convert row from database to Game type
 */
function rowToGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as number,
    igdbId: row.igdb_id as number,
    name: row.name as string,
    slug: row.slug as string,
    summary: row.summary as string | null,
    storyline: row.storyline as string | null,
    coverUrl: row.cover_url as string | null,
    releaseDate: row.release_date as number | null,
    rating: row.rating as number | null,
    ratingCount: row.rating_count as number | null,
    genres: JSON.parse((row.genres as string) || "[]"),
    themes: JSON.parse((row.themes as string) || "[]"),
    platforms: JSON.parse((row.platforms as string) || "[]"),
    gameModes: JSON.parse((row.game_modes as string) || "[]"),
    similarGames: JSON.parse((row.similar_games as string) || "[]"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * convert row to LibraryEntry type
 */
function rowToLibraryEntry(row: Record<string, unknown>): LibraryEntry {
  return {
    id: row.id as number,
    gameId: row.game_id as number,
    status: row.status as GameStatus,
    userRating: row.user_rating as number | null,
    notes: row.notes as string | null,
    hoursPlayed: row.hours_played as number | null,
    completedAt: row.completed_at as string | null,
    startedAt: row.started_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================
// GAME OPERATIONS
// ============================================

/**
 * insert or update a game from IGDB data
 */
export function upsertGame(
  db: Database.Database,
  game: Omit<Game, "id" | "createdAt" | "updatedAt">,
): number {
  const stmt = db.prepare(`
    INSERT INTO games (igdb_id, name, slug, summary, storyline, cover_url, release_date, rating, rating_count, genres, themes, platforms, game_modes, similar_games)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(igdb_id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      summary = excluded.summary,
      storyline = excluded.storyline,
      cover_url = excluded.cover_url,
      release_date = excluded.release_date,
      rating = excluded.rating,
      rating_count = excluded.rating_count,
      genres = excluded.genres,
      themes = excluded.themes,
      platforms = excluded.platforms,
      game_modes = excluded.game_modes,
      similar_games = excluded.similar_games,
      updated_at = CURRENT_TIMESTAMP
  `);

  const result = stmt.run(
    game.igdbId,
    game.name,
    game.slug,
    game.summary,
    game.storyline,
    game.coverUrl,
    game.releaseDate,
    game.rating,
    game.ratingCount,
    JSON.stringify(game.genres),
    JSON.stringify(game.themes),
    JSON.stringify(game.platforms),
    JSON.stringify(game.gameModes),
    JSON.stringify(game.similarGames),
  );

  // get the id of the inserted/updated game
  const idStmt = db.prepare("SELECT id FROM games WHERE igdb_id = ?");
  const row = idStmt.get(game.igdbId) as { id: number };
  return row.id;
}

/**
 * get a game by internal id
 */
export function getGameById(db: Database.Database, id: number): Game | null {
  const stmt = db.prepare("SELECT * FROM games WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? rowToGame(row) : null;
}

/**
 * get a game by IGDB id
 */
export function getGameByIgdbId(
  db: Database.Database,
  igdbId: number,
): Game | null {
  const stmt = db.prepare("SELECT * FROM games WHERE igdb_id = ?");
  const row = stmt.get(igdbId) as Record<string, unknown> | undefined;
  return row ? rowToGame(row) : null;
}

/**
 * search games by name
 */
export function searchGames(db: Database.Database, query: string): Game[] {
  const stmt = db.prepare(
    "SELECT * FROM games WHERE name LIKE ? ORDER BY name LIMIT 50",
  );
  const rows = stmt.all(`%${query}%`) as Record<string, unknown>[];
  return rows.map(rowToGame);
}

// ============================================
// LIBRARY OPERATIONS
// ============================================

/**
 * add a game to the library
 */
export function addToLibrary(
  db: Database.Database,
  gameId: number,
  status: GameStatus,
  options?: { userRating?: number; notes?: string; hoursPlayed?: number },
): number {
  const stmt = db.prepare(`
    INSERT INTO library (game_id, status, user_rating, notes, hours_played)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(game_id) DO UPDATE SET
      status = excluded.status,
      user_rating = COALESCE(excluded.user_rating, library.user_rating),
      notes = COALESCE(excluded.notes, library.notes),
      hours_played = COALESCE(excluded.hours_played, library.hours_played),
      updated_at = CURRENT_TIMESTAMP
  `);

  const result = stmt.run(
    gameId,
    status,
    options?.userRating ?? null,
    options?.notes ?? null,
    options?.hoursPlayed ?? null,
  );
  return result.lastInsertRowid as number;
}

/**
 * update library entry
 */
export function updateLibraryEntry(
  db: Database.Database,
  gameId: number,
  updates: Partial<
    Pick<
      LibraryEntry,
      | "status"
      | "userRating"
      | "notes"
      | "hoursPlayed"
      | "completedAt"
      | "startedAt"
    >
  >,
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (updates.userRating !== undefined) {
    fields.push("user_rating = ?");
    values.push(updates.userRating);
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    values.push(updates.notes);
  }
  if (updates.hoursPlayed !== undefined) {
    fields.push("hours_played = ?");
    values.push(updates.hoursPlayed);
  }
  if (updates.completedAt !== undefined) {
    fields.push("completed_at = ?");
    values.push(updates.completedAt);
  }
  if (updates.startedAt !== undefined) {
    fields.push("started_at = ?");
    values.push(updates.startedAt);
  }

  if (fields.length === 0) return;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(gameId);

  const stmt = db.prepare(
    `UPDATE library SET ${fields.join(", ")} WHERE game_id = ?`,
  );
  stmt.run(...values);
}

/**
 * remove a game from library
 */
export function removeFromLibrary(db: Database.Database, gameId: number): void {
  const stmt = db.prepare("DELETE FROM library WHERE game_id = ?");
  stmt.run(gameId);
}

/**
 * get library entry for a game
 */
export function getLibraryEntry(
  db: Database.Database,
  gameId: number,
): LibraryEntry | null {
  const stmt = db.prepare("SELECT * FROM library WHERE game_id = ?");
  const row = stmt.get(gameId) as Record<string, unknown> | undefined;
  return row ? rowToLibraryEntry(row) : null;
}

/**
 * get all library entries with game data
 */
export function getLibrary(
  db: Database.Database,
  filters?: LibraryFilters,
): LibraryEntryWithGame[] {
  let query = `
    SELECT l.*, g.*,
           l.id as library_id, g.id as game_id
    FROM library l
    JOIN games g ON l.game_id = g.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.status) {
    query += " AND l.status = ?";
    params.push(filters.status);
  }
  if (filters?.minRating !== undefined) {
    query += " AND l.user_rating >= ?";
    params.push(filters.minRating);
  }
  if (filters?.maxRating !== undefined) {
    query += " AND l.user_rating <= ?";
    params.push(filters.maxRating);
  }
  if (filters?.search) {
    query += " AND g.name LIKE ?";
    params.push(`%${filters.search}%`);
  }

  query += " ORDER BY l.updated_at DESC";

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Record<string, unknown>[];

  return rows.map((row) => {
    // get categories for this game
    const catStmt = db.prepare(`
      SELECT c.* FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ?
    `);
    const categories = catStmt.all(row.game_id) as Category[];

    return {
      id: row.library_id as number,
      gameId: row.game_id as number,
      status: row.status as GameStatus,
      userRating: row.user_rating as number | null,
      notes: row.notes as string | null,
      hoursPlayed: row.hours_played as number | null,
      completedAt: row.completed_at as string | null,
      startedAt: row.started_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      game: rowToGame(row),
      categories,
    };
  });
}

/**
 * get library stats
 */
export function getLibraryStats(db: Database.Database): Record<string, number> {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'played' THEN 1 ELSE 0 END) as played,
      SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) as playing,
      SUM(CASE WHEN status = 'backlog' THEN 1 ELSE 0 END) as backlog,
      SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) as dropped,
      SUM(CASE WHEN status = 'wishlist' THEN 1 ELSE 0 END) as wishlist,
      AVG(user_rating) as avg_rating,
      SUM(hours_played) as total_hours
    FROM library
  `);
  return stmt.get() as Record<string, number>;
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * create a category
 */
export function createCategory(
  db: Database.Database,
  name: string,
  description?: string,
  color?: string,
): number {
  const stmt = db.prepare(
    "INSERT INTO categories (name, description, color) VALUES (?, ?, ?)",
  );
  const result = stmt.run(name, description ?? null, color ?? null);
  return result.lastInsertRowid as number;
}

/**
 * get all categories
 */
export function getCategories(db: Database.Database): Category[] {
  const stmt = db.prepare("SELECT * FROM categories ORDER BY name");
  return stmt.all() as Category[];
}

/**
 * add game to category
 */
export function addGameToCategory(
  db: Database.Database,
  gameId: number,
  categoryId: number,
): void {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO game_categories (game_id, category_id) VALUES (?, ?)",
  );
  stmt.run(gameId, categoryId);
}

/**
 * remove game from category
 */
export function removeGameFromCategory(
  db: Database.Database,
  gameId: number,
  categoryId: number,
): void {
  const stmt = db.prepare(
    "DELETE FROM game_categories WHERE game_id = ? AND category_id = ?",
  );
  stmt.run(gameId, categoryId);
}

// ============================================
// RECOMMENDATION LOG OPERATIONS
// ============================================

/**
 * log a recommendation
 */
export function logRecommendation(
  db: Database.Database,
  gameId: number,
  context?: string,
): number {
  const stmt = db.prepare(
    "INSERT INTO recommendation_log (game_id, context) VALUES (?, ?)",
  );
  const result = stmt.run(gameId, context ?? null);
  return result.lastInsertRowid as number;
}

/**
 * update recommendation response
 */
export function updateRecommendationResponse(
  db: Database.Database,
  logId: number,
  response: RecommendationResponse,
): void {
  const stmt = db.prepare(
    "UPDATE recommendation_log SET response = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?",
  );
  stmt.run(response, logId);
}

/**
 * get recommendation history for a game
 */
export function getRecommendationHistory(
  db: Database.Database,
  gameId: number,
): RecommendationLog[] {
  const stmt = db.prepare(
    "SELECT * FROM recommendation_log WHERE game_id = ? ORDER BY recommended_at DESC",
  );
  return stmt.all(gameId) as RecommendationLog[];
}

/**
 * get recent recommendations
 */
export function getRecentRecommendations(
  db: Database.Database,
  limit = 20,
): Array<RecommendationLog & { game: Game }> {
  const stmt = db.prepare(`
    SELECT r.*, g.*,
           r.id as rec_id
    FROM recommendation_log r
    JOIN games g ON r.game_id = g.id
    ORDER BY r.recommended_at DESC
    LIMIT ?
  `);
  const rows = stmt.all(limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.rec_id as number,
    gameId: row.game_id as number,
    recommendedAt: row.recommended_at as string,
    context: row.context as string | null,
    response: row.response as RecommendationResponse | null,
    respondedAt: row.responded_at as string | null,
    game: rowToGame(row),
  }));
}

/**
 * get games that were rejected (to avoid recommending again)
 */
export function getRejectedGameIds(db: Database.Database): number[] {
  const stmt = db.prepare(
    "SELECT DISTINCT game_id FROM recommendation_log WHERE response = 'rejected'",
  );
  const rows = stmt.all() as Array<{ game_id: number }>;
  return rows.map((r) => r.game_id);
}

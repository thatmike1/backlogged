/**
 * game status in user's library
 */
export type GameStatus =
  | "backlog"
  | "playing"
  | "played"
  | "dropped"
  | "wishlist"
  | "skipped";

/**
 * recommendation response from user
 */
export type RecommendationResponse =
  | "accepted"
  | "rejected"
  | "played"
  | "maybe_later";

/**
 * game data from IGDB (cached locally)
 */
export interface Game {
  id: number;
  igdbId: number;
  name: string;
  slug: string;
  summary: string | null;
  storyline: string | null;
  coverUrl: string | null;
  releaseDate: number | null;
  rating: number | null;
  ratingCount: number | null;
  genres: string[];
  themes: string[];
  platforms: string[];
  gameModes: string[];
  similarGames: number[];
  createdAt: string;
  updatedAt: string;
}

/**
 * user's library entry for a game
 */
export interface LibraryEntry {
  id: number;
  gameId: number;
  status: GameStatus;
  userRating: number | null;
  notes: string | null;
  hoursPlayed: number | null;
  completedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * custom category/tag for organizing games
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
}

/**
 * mapping between games and categories
 */
export interface GameCategory {
  gameId: number;
  categoryId: number;
}

/**
 * log of AI recommendations and user responses
 */
export interface RecommendationLog {
  id: number;
  gameId: number;
  recommendedAt: string;
  context: string | null;
  response: RecommendationResponse | null;
  respondedAt: string | null;
}

/**
 * IGDB API response types
 */
export interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  cover?: { url: string };
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
  genres?: Array<{ name: string }>;
  themes?: Array<{ name: string }>;
  platforms?: Array<{ name: string }>;
  game_modes?: Array<{ name: string }>;
  similar_games?: number[];
}

/**
 * IGDB authentication token
 */
export interface IgdbToken {
  accessToken: string;
  expiresAt: number;
}

/**
 * library entry with full game data joined
 */
export interface LibraryEntryWithGame extends LibraryEntry {
  game: Game;
  categories: Category[];
}

/**
 * search filters for library queries
 */
export interface LibraryFilters {
  status?: GameStatus;
  minRating?: number;
  maxRating?: number;
  genres?: string[];
  categories?: string[];
  search?: string;
}

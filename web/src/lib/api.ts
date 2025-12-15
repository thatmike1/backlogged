/**
 * game status options
 */
export type GameStatus =
  | "played"
  | "playing"
  | "backlog"
  | "dropped"
  | "wishlist"
  | "skipped";

/**
 * library game entry
 */
export interface LibraryGame {
  id: number;
  igdbId: number;
  name: string;
  coverUrl: string | null;
  status: GameStatus;
  rating: number | null;
  notes: string | null;
  hoursPlayed: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * igdb game data
 */
export interface IgdbGame {
  igdbId: number;
  name: string;
  summary: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  genres: string[];
  platforms: string[];
  rating: number | null;
  similarGames: number[];
}

/**
 * library stats
 */
export interface LibraryStats {
  totalGames: number;
  byStatus: Record<GameStatus, number>;
  averageRating: number | null;
  totalHoursPlayed: number;
  topGenres: Array<{ genre: string; count: number }>;
}

/**
 * category
 */
export interface Category {
  id: number;
  name: string;
  color: string;
  gameCount: number;
}

/**
 * api error response
 */
export interface ApiError {
  message: string;
  code?: string;
}

/**
 * api response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * base fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: "An unknown error occurred",
    }));
    throw new Error(error.message);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

/**
 * library api methods
 */
export const library = {
  /**
   * fetches all games in the library
   */
  getAll: (params?: {
    status?: GameStatus;
    minRating?: number;
    query?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.minRating)
      searchParams.set("minRating", params.minRating.toString());
    if (params?.query) searchParams.set("query", params.query);
    const queryString = searchParams.toString();
    return fetchApi<LibraryGame[]>(
      `/library${queryString ? `?${queryString}` : ""}`,
    );
  },

  /**
   * adds a game to the library
   */
  add: (data: {
    igdbId: number;
    status: GameStatus;
    rating?: number;
    notes?: string;
  }) =>
    fetchApi<LibraryGame>("/library", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * updates a game in the library
   */
  update: (
    id: number,
    data: Partial<{
      status: GameStatus;
      rating: number | null;
      notes: string | null;
      hoursPlayed: number | null;
      completedAt: string | null;
    }>,
  ) =>
    fetchApi<LibraryGame>(`/library/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /**
   * removes a game from the library
   */
  remove: (id: number) =>
    fetchApi<void>(`/library/${id}`, {
      method: "DELETE",
    }),
};

/**
 * igdb api methods
 */
export const igdb = {
  /**
   * searches for games on igdb
   */
  search: (query: string) =>
    fetchApi<IgdbGame[]>(`/igdb/search?q=${encodeURIComponent(query)}`),

  /**
   * gets a single game from igdb by id
   */
  getGame: (igdbId: number) => fetchApi<IgdbGame>(`/igdb/game/${igdbId}`),

  /**
   * discovers games based on filters
   */
  discover: (params?: {
    genre?: string;
    platform?: string;
    minRating?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.set("genre", params.genre);
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.minRating)
      searchParams.set("minRating", params.minRating.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const queryString = searchParams.toString();
    return fetchApi<IgdbGame[]>(
      `/igdb/discover${queryString ? `?${queryString}` : ""}`,
    );
  },
};

/**
 * stats api methods
 */
export const stats = {
  /**
   * gets library statistics
   */
  get: () => fetchApi<LibraryStats>("/stats"),
};

/**
 * categories api methods
 */
export const categories = {
  /**
   * gets all categories
   */
  getAll: () => fetchApi<Category[]>("/categories"),

  /**
   * creates a new category
   */
  create: (data: { name: string; color: string }) =>
    fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * updates a category
   */
  update: (id: number, data: Partial<{ name: string; color: string }>) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /**
   * deletes a category
   */
  delete: (id: number) =>
    fetchApi<void>(`/categories/${id}`, {
      method: "DELETE",
    }),

  /**
   * adds a game to a category
   */
  addGame: (categoryId: number, gameId: number) =>
    fetchApi<void>(`/categories/${categoryId}/games/${gameId}`, {
      method: "POST",
    }),

  /**
   * removes a game from a category
   */
  removeGame: (categoryId: number, gameId: number) =>
    fetchApi<void>(`/categories/${categoryId}/games/${gameId}`, {
      method: "DELETE",
    }),
};

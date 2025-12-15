import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { IgdbGame, IgdbToken, Game } from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");
const TOKEN_PATH = join(DATA_DIR, "token.json");

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE_URL = "https://api.igdb.com/v4";

/**
 * get credentials from environment
 */
function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in environment. " +
        "See docs/api-setup.md for setup instructions.",
    );
  }

  return { clientId, clientSecret };
}

/**
 * load cached token from disk
 */
function loadCachedToken(): IgdbToken | null {
  if (!existsSync(TOKEN_PATH)) {
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
    return data as IgdbToken;
  } catch {
    return null;
  }
}

/**
 * save token to disk
 */
function saveToken(token: IgdbToken): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

/**
 * fetch a new access token from Twitch
 */
async function fetchAccessToken(): Promise<IgdbToken> {
  const { clientId, clientSecret } = getCredentials();

  const response = await fetch(TWITCH_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  const token: IgdbToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000, // 1 minute buffer
  };

  saveToken(token);
  return token;
}

/**
 * get a valid access token (from cache or fetch new)
 */
async function getAccessToken(): Promise<string> {
  const cached = loadCachedToken();

  if (cached && cached.expiresAt > Date.now()) {
    return cached.accessToken;
  }

  const token = await fetchAccessToken();
  return token.accessToken;
}

/**
 * make an IGDB API request
 */
async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
  const { clientId } = getCredentials();
  const accessToken = await getAccessToken();

  const response = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IGDB API error: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

/**
 * convert IGDB game to our format
 */
function igdbToGame(
  igdb: IgdbGame,
): Omit<Game, "id" | "createdAt" | "updatedAt"> {
  return {
    igdbId: igdb.id,
    name: igdb.name,
    slug: igdb.slug,
    summary: igdb.summary ?? null,
    storyline: igdb.storyline ?? null,
    coverUrl: igdb.cover?.url
      ? `https:${igdb.cover.url.replace("t_thumb", "t_cover_big")}`
      : null,
    releaseDate: igdb.first_release_date ?? null,
    rating: igdb.total_rating ?? null,
    ratingCount: igdb.total_rating_count ?? null,
    genres: igdb.genres?.map((g) => g.name) ?? [],
    themes: igdb.themes?.map((t) => t.name) ?? [],
    platforms: igdb.platforms?.map((p) => p.name) ?? [],
    gameModes: igdb.game_modes?.map((m) => m.name) ?? [],
    similarGames: igdb.similar_games ?? [],
  };
}

/**
 * search for games by name
 */
export async function searchGames(
  query: string,
  limit = 10,
): Promise<Array<Omit<Game, "id" | "createdAt" | "updatedAt">>> {
  const body = `
    search "${query}";
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    limit ${limit};
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.map(igdbToGame);
}

/**
 * get a game by IGDB id
 */
export async function getGameById(
  igdbId: number,
): Promise<Omit<Game, "id" | "createdAt" | "updatedAt"> | null> {
  const body = `
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    where id = ${igdbId};
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.length > 0 ? igdbToGame(results[0]) : null;
}

/**
 * get popular games (for discovery)
 */
export async function getPopularGames(
  limit = 20,
): Promise<Array<Omit<Game, "id" | "createdAt" | "updatedAt">>> {
  const body = `
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    where total_rating_count > 100;
    sort total_rating desc;
    limit ${limit};
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.map(igdbToGame);
}

/**
 * get games by genre
 */
export async function getGamesByGenre(
  genre: string,
  limit = 20,
): Promise<Array<Omit<Game, "id" | "createdAt" | "updatedAt">>> {
  // first get genre id
  const genreResults = await igdbRequest<Array<{ id: number; name: string }>>(
    "genres",
    `fields id, name; where name ~ *"${genre}"*; limit 1;`,
  );

  if (genreResults.length === 0) {
    return [];
  }

  const genreId = genreResults[0].id;

  const body = `
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    where genres = [${genreId}] & total_rating_count > 50;
    sort total_rating desc;
    limit ${limit};
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.map(igdbToGame);
}

/**
 * get similar games to a given game
 */
export async function getSimilarGames(
  similarGameIds: number[],
  limit = 10,
): Promise<Array<Omit<Game, "id" | "createdAt" | "updatedAt">>> {
  if (similarGameIds.length === 0) {
    return [];
  }

  const ids = similarGameIds.slice(0, limit).join(",");

  const body = `
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    where id = (${ids});
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.map(igdbToGame);
}

/**
 * get recently released games
 */
export async function getRecentGames(
  limit = 20,
): Promise<Array<Omit<Game, "id" | "createdAt" | "updatedAt">>> {
  const now = Math.floor(Date.now() / 1000);
  const threeMonthsAgo = now - 90 * 24 * 60 * 60;

  const body = `
    fields name, slug, summary, storyline, cover.url, first_release_date,
           total_rating, total_rating_count, genres.name, themes.name,
           platforms.name, game_modes.name, similar_games;
    where first_release_date > ${threeMonthsAgo} & first_release_date < ${now} & total_rating_count > 10;
    sort first_release_date desc;
    limit ${limit};
  `;

  const results = await igdbRequest<IgdbGame[]>("games", body);
  return results.map(igdbToGame);
}

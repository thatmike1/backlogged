import { Router, Request, Response, NextFunction } from "express";
import {
  searchGames,
  getGameById,
  getPopularGames,
  getGamesByGenre,
  getRecentGames,
} from "../../src/services/igdb.js";
import { upsertGame } from "../../src/db/index.js";
import type { Game } from "../../src/types/index.js";

const router = Router();

/**
 * GET /search - search IGDB for games
 * query params: q (search query), limit (optional)
 */
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      if (!query) {
        res.status(400).json({
          success: false,
          error: "Search query (q) is required",
        });
        return;
      }

      const games = await searchGames(query, limit);
      res.json({ success: true, data: games });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /game/:id - get game from IGDB by id and cache it
 */
router.get(
  "/game/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const igdbId = parseInt(req.params.id, 10);

      if (isNaN(igdbId)) {
        res.status(400).json({
          success: false,
          error: "Invalid IGDB game id",
        });
        return;
      }

      const game = await getGameById(igdbId);

      if (!game) {
        res.status(404).json({
          success: false,
          error: `Game with IGDB ID ${igdbId} not found`,
        });
        return;
      }

      // cache the game in local database
      const localId = upsertGame(req.db, game);

      res.json({
        success: true,
        data: {
          ...game,
          localId,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /discover - discover games by type or genre
 * query params: type (popular|recent), genre (optional), limit (optional)
 */
router.get(
  "/discover",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = req.query.type as string;
      const genre = req.query.genre as string;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 20;

      let games: Array<Omit<Game, "id" | "createdAt" | "updatedAt">>;

      if (genre) {
        games = await getGamesByGenre(genre, limit);
      } else if (type === "recent") {
        games = await getRecentGames(limit);
      } else {
        // default to popular
        games = await getPopularGames(limit);
      }

      res.json({ success: true, data: games });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

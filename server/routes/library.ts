import { Router, Request, Response, NextFunction } from "express";
import {
  getLibrary,
  addToLibrary,
  updateLibraryEntry,
  removeFromLibrary,
  upsertGame,
} from "../../src/db/index.js";
import { getGameById as getGameFromIgdb } from "../../src/services/igdb.js";
import type { GameStatus, LibraryFilters } from "../../src/types/index.js";

const router = Router();

/**
 * GET / - get library entries with optional filters
 * query params: status, minRating, maxRating, search
 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: LibraryFilters = {};

    if (req.query.status) {
      filters.status = req.query.status as GameStatus;
    }
    if (req.query.minRating) {
      filters.minRating = parseFloat(req.query.minRating as string);
    }
    if (req.query.maxRating) {
      filters.maxRating = parseFloat(req.query.maxRating as string);
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const entries = getLibrary(req.db, filters);
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
});

/**
 * POST / - add a game to library
 * body: { igdbId, status, rating?, notes?, hours? }
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { igdbId, status, rating, notes, hours } = req.body;

    if (!igdbId || !status) {
      res.status(400).json({
        success: false,
        error: "igdbId and status are required",
      });
      return;
    }

    // fetch game from IGDB
    const igdbGame = await getGameFromIgdb(igdbId);

    if (!igdbGame) {
      res.status(404).json({
        success: false,
        error: `Game with IGDB ID ${igdbId} not found`,
      });
      return;
    }

    // upsert game to local database
    const gameId = upsertGame(req.db, igdbGame);

    // add to library
    const libraryId = addToLibrary(req.db, gameId, status as GameStatus, {
      userRating: rating,
      notes,
      hoursPlayed: hours,
    });

    res.status(201).json({
      success: true,
      data: { libraryId, gameId },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /:gameId - update library entry
 * body: { status?, userRating?, notes?, hoursPlayed?, completedAt?, startedAt? }
 */
router.put("/:gameId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);

    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: "Invalid gameId",
      });
      return;
    }

    const { status, userRating, notes, hoursPlayed, completedAt, startedAt } =
      req.body;

    updateLibraryEntry(req.db, gameId, {
      status,
      userRating,
      notes,
      hoursPlayed,
      completedAt,
      startedAt,
    });

    res.json({ success: true, data: { gameId } });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /:gameId - remove game from library
 */
router.delete("/:gameId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);

    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: "Invalid gameId",
      });
      return;
    }

    removeFromLibrary(req.db, gameId);
    res.json({ success: true, data: { gameId } });
  } catch (err) {
    next(err);
  }
});

export default router;

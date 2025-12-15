import { Router, Request, Response, NextFunction } from "express";
import { getGameByIgdbId } from "../../src/db/index.js";

const router = Router();

/**
 * GET /:igdbId - get cached game by IGDB id
 */
router.get("/:igdbId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const igdbId = parseInt(req.params.igdbId, 10);

    if (isNaN(igdbId)) {
      res.status(400).json({
        success: false,
        error: "Invalid igdbId",
      });
      return;
    }

    const game = getGameByIgdbId(req.db, igdbId);

    if (!game) {
      res.status(404).json({
        success: false,
        error: `Game with IGDB ID ${igdbId} not found in cache`,
      });
      return;
    }

    res.json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
});

export default router;

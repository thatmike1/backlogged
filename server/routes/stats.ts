import { Router, Request, Response, NextFunction } from "express";
import { getLibraryStats, getTopGenres } from "../../src/db/index.js";

const router = Router();

/**
 * library stats shape expected by frontend
 */
interface LibraryStats {
  totalGames: number;
  byStatus: {
    played: number;
    playing: number;
    backlog: number;
    dropped: number;
    wishlist: number;
    skipped: number;
  };
  averageRating: number | null;
  totalHoursPlayed: number;
  topGenres: Array<{ genre: string; count: number }>;
}

/**
 * GET / - get library statistics
 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawStats = getLibraryStats(req.app.locals.db);
    const topGenres = getTopGenres(req.app.locals.db, 10);

    // transform to frontend expected shape
    const stats: LibraryStats = {
      totalGames: rawStats.total,
      byStatus: {
        played: rawStats.played,
        playing: rawStats.playing,
        backlog: rawStats.backlog,
        dropped: rawStats.dropped,
        wishlist: rawStats.wishlist,
        skipped: rawStats.skipped,
      },
      averageRating: rawStats.avg_rating,
      totalHoursPlayed: rawStats.total_hours ?? 0,
      topGenres,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;

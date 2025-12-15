import { Router, Request, Response, NextFunction } from "express";
import { getLibraryStats } from "../../src/db/index.js";

const router = Router();

/**
 * GET / - get library statistics
 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = getLibraryStats(req.db);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;

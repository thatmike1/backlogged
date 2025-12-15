import { Router, Request, Response, NextFunction } from "express";
import {
  getCategories,
  createCategory,
  addGameToCategory,
  removeGameFromCategory,
} from "../../src/db/index.js";

const router = Router();

/**
 * GET / - get all categories
 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = getCategories(req.app.locals.db);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

/**
 * POST / - create a new category
 * body: { name, description?, color? }
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: "Category name is required",
      });
      return;
    }

    const categoryId = createCategory(
      req.app.locals.db,
      name,
      description,
      color,
    );
    res.status(201).json({ success: true, data: { categoryId } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /games/:gameId/:categoryId - add game to category
 */
router.post(
  "/games/:gameId/:categoryId",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameId = parseInt(req.params.gameId, 10);
      const categoryId = parseInt(req.params.categoryId, 10);

      if (isNaN(gameId) || isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: "Invalid gameId or categoryId",
        });
        return;
      }

      addGameToCategory(req.app.locals.db, gameId, categoryId);
      res.json({ success: true, data: { gameId, categoryId } });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /games/:gameId/:categoryId - remove game from category
 */
router.delete(
  "/games/:gameId/:categoryId",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameId = parseInt(req.params.gameId, 10);
      const categoryId = parseInt(req.params.categoryId, 10);

      if (isNaN(gameId) || isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: "Invalid gameId or categoryId",
        });
        return;
      }

      removeGameFromCategory(req.app.locals.db, gameId, categoryId);
      res.json({ success: true, data: { gameId, categoryId } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

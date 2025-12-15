import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { getDb } from "../src/db/index.js";
import libraryRoutes from "./routes/library.js";
import gamesRoutes from "./routes/games.js";
import igdbRoutes from "./routes/igdb.js";
import categoriesRoutes from "./routes/categories.js";
import statsRoutes from "./routes/stats.js";

const app = express();
const PORT = 3000;

/**
 * cors configuration for React frontend
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/**
 * parse JSON request bodies
 */
app.use(express.json());

/**
 * middleware to attach database connection to request
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.db = getDb();
  next();
});

/**
 * mount API routes
 */
app.use("/api/library", libraryRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/igdb", igdbRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stats", statsRoutes);

/**
 * health check endpoint
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: "ok" } });
});

/**
 * error handling middleware
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err.message);

  // close database connection on error
  if (req.db) {
    req.db.close();
  }

  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

/**
 * middleware to close database connection after response
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (req.db) {
      req.db.close();
    }
  });
  next();
});

app.listen(PORT, () => {
  console.log(`Backlogged API server running on http://localhost:${PORT}`);
});

/**
 * extend Express Request type to include database
 */
declare global {
  namespace Express {
    interface Request {
      db: ReturnType<typeof getDb>;
    }
  }
}

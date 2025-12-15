import "dotenv/config";
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
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

/**
 * parse JSON request bodies
 */
app.use(express.json());

/**
 * set database connection on app.locals for routes to access
 */
app.locals.db = getDb();

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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err.message);

  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Backlogged API server running on http://localhost:${PORT}`);
});

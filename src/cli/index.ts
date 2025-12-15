#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import {
  getDb,
  upsertGame,
  addToLibrary,
  updateLibraryEntry,
  removeFromLibrary,
  getLibrary,
  getLibraryStats,
  getCategories,
  createCategory,
  addGameToCategory,
  getGameByIgdbId,
  searchGames as searchLocalGames,
  logRecommendation,
  updateRecommendationResponse,
  getRecentRecommendations,
} from "../db/index.js";
import * as igdb from "../services/igdb.js";
import type { GameStatus, RecommendationResponse } from "../types/index.js";

const program = new Command();

program
  .name("backlogged")
  .description("Personal game library and discovery CLI")
  .version("0.1.0");

/**
 * search command - search IGDB for games
 */
program
  .command("search <query>")
  .description("Search IGDB for games")
  .option("-l, --limit <number>", "Number of results", "10")
  .action(async (query: string, options: { limit: string }) => {
    try {
      const results = await igdb.searchGames(query, parseInt(options.limit));

      if (results.length === 0) {
        console.log("No games found.");
        return;
      }

      console.log(`\nFound ${results.length} games:\n`);
      for (const game of results) {
        const year = game.releaseDate
          ? new Date(game.releaseDate * 1000).getFullYear()
          : "N/A";
        const rating = game.rating ? game.rating.toFixed(0) : "N/A";
        console.log(
          `[${game.igdbId}] ${game.name} (${year}) - Rating: ${rating}`,
        );
        if (game.genres.length > 0) {
          console.log(`    Genres: ${game.genres.join(", ")}`);
        }
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * add command - add a game to library
 */
program
  .command("add <igdbId>")
  .description("Add a game to your library by IGDB ID")
  .option(
    "-s, --status <status>",
    "Status (backlog, playing, played, dropped, wishlist, skipped)",
    "backlog",
  )
  .option("-r, --rating <number>", "Your rating (1-10)")
  .option("-n, --notes <text>", "Notes about the game")
  .option("-h, --hours <number>", "Hours played")
  .action(
    async (
      igdbId: string,
      options: {
        status: string;
        rating?: string;
        notes?: string;
        hours?: string;
      },
    ) => {
      try {
        const db = getDb();

        // check if we have this game cached
        let localGame = getGameByIgdbId(db, parseInt(igdbId));

        // if not, fetch from IGDB and cache it
        if (!localGame) {
          console.log("Fetching game data from IGDB...");
          const igdbGame = await igdb.getGameById(parseInt(igdbId));
          if (!igdbGame) {
            console.error("Game not found on IGDB.");
            process.exit(1);
          }
          const gameId = upsertGame(db, igdbGame);
          localGame = { ...igdbGame, id: gameId, createdAt: "", updatedAt: "" };
        }

        // add to library
        addToLibrary(db, localGame.id, options.status as GameStatus, {
          userRating: options.rating ? parseFloat(options.rating) : undefined,
          notes: options.notes,
          hoursPlayed: options.hours ? parseFloat(options.hours) : undefined,
        });

        console.log(
          `\n✓ Added "${localGame.name}" to your library as ${options.status}`,
        );
        db.close();
      } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
      }
    },
  );

/**
 * library command - view your library
 */
program
  .command("library")
  .description("View your game library")
  .option(
    "-s, --status <status>",
    "Filter by status (backlog, playing, played, dropped, wishlist, skipped)",
  )
  .option("-m, --min-rating <number>", "Minimum rating")
  .option("-q, --search <query>", "Search by name")
  .action(
    async (options: {
      status?: string;
      minRating?: string;
      search?: string;
    }) => {
      try {
        const db = getDb();
        const entries = getLibrary(db, {
          status: options.status as GameStatus | undefined,
          minRating: options.minRating
            ? parseInt(options.minRating)
            : undefined,
          search: options.search,
        });

        if (entries.length === 0) {
          console.log("No games in your library matching those filters.");
          db.close();
          return;
        }

        console.log(`\nYour Library (${entries.length} games):\n`);
        for (const entry of entries) {
          const rating = entry.userRating
            ? `${entry.userRating}/10`
            : "unrated";
          const hours = entry.hoursPlayed ? `${entry.hoursPlayed}h` : "";
          console.log(
            `[${entry.game.igdbId}] ${entry.game.name} - ${entry.status} (${rating}) ${hours}`,
          );
          if (entry.notes) {
            console.log(`    Notes: ${entry.notes}`);
          }
          if (entry.categories.length > 0) {
            console.log(
              `    Categories: ${entry.categories.map((c) => c.name).join(", ")}`,
            );
          }
        }

        db.close();
      } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
      }
    },
  );

/**
 * update command - update a library entry
 */
program
  .command("update <igdbId>")
  .description("Update a game in your library")
  .option("-s, --status <status>", "New status")
  .option("-r, --rating <number>", "New rating (1-10)")
  .option("-n, --notes <text>", "New notes")
  .option("-h, --hours <number>", "Hours played")
  .action(
    async (
      igdbId: string,
      options: {
        status?: string;
        rating?: string;
        notes?: string;
        hours?: string;
      },
    ) => {
      try {
        const db = getDb();
        const game = getGameByIgdbId(db, parseInt(igdbId));

        if (!game) {
          console.error("Game not found in your library.");
          process.exit(1);
        }

        updateLibraryEntry(db, game.id, {
          status: options.status as GameStatus | undefined,
          userRating: options.rating ? parseFloat(options.rating) : undefined,
          notes: options.notes,
          hoursPlayed: options.hours ? parseFloat(options.hours) : undefined,
        });

        console.log(`✓ Updated "${game.name}"`);
        db.close();
      } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
      }
    },
  );

/**
 * remove command - remove from library
 */
program
  .command("remove <igdbId>")
  .description("Remove a game from your library")
  .action(async (igdbId: string) => {
    try {
      const db = getDb();
      const game = getGameByIgdbId(db, parseInt(igdbId));

      if (!game) {
        console.error("Game not found in your library.");
        process.exit(1);
      }

      removeFromLibrary(db, game.id);
      console.log(`✓ Removed "${game.name}" from your library`);
      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * stats command - show library statistics
 */
program
  .command("stats")
  .description("Show library statistics")
  .action(async () => {
    try {
      const db = getDb();
      const stats = getLibraryStats(db);

      console.log("\nLibrary Statistics:");
      console.log(`  Total games: ${stats.total || 0}`);
      console.log(`  Played: ${stats.played || 0}`);
      console.log(`  Playing: ${stats.playing || 0}`);
      console.log(`  Backlog: ${stats.backlog || 0}`);
      console.log(`  Dropped: ${stats.dropped || 0}`);
      console.log(`  Wishlist: ${stats.wishlist || 0}`);
      if (stats.avg_rating) {
        console.log(`  Average rating: ${stats.avg_rating.toFixed(1)}/10`);
      }
      if (stats.total_hours) {
        console.log(`  Total hours: ${stats.total_hours.toFixed(0)}`);
      }

      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * categories command - manage categories
 */
program
  .command("categories")
  .description("List all categories")
  .action(async () => {
    try {
      const db = getDb();
      const categories = getCategories(db);

      console.log("\nCategories:");
      for (const cat of categories) {
        console.log(`  [${cat.id}] ${cat.name}`);
        if (cat.description) {
          console.log(`      ${cat.description}`);
        }
      }

      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * category-add command - create a new category
 */
program
  .command("category-add <name>")
  .description("Create a new category")
  .option("-d, --description <text>", "Category description")
  .option("-c, --color <hex>", "Category color (hex)")
  .action(
    async (name: string, options: { description?: string; color?: string }) => {
      try {
        const db = getDb();
        createCategory(db, name, options.description, options.color);
        console.log(`✓ Created category "${name}"`);
        db.close();
      } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
      }
    },
  );

/**
 * tag command - add a game to a category
 */
program
  .command("tag <igdbId> <categoryId>")
  .description("Add a game to a category")
  .action(async (igdbId: string, categoryId: string) => {
    try {
      const db = getDb();
      const game = getGameByIgdbId(db, parseInt(igdbId));

      if (!game) {
        console.error("Game not found in your library.");
        process.exit(1);
      }

      addGameToCategory(db, game.id, parseInt(categoryId));
      console.log(`✓ Tagged "${game.name}"`);
      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * discover command - get game recommendations from IGDB
 */
program
  .command("discover")
  .description("Discover new games")
  .option("-g, --genre <genre>", "Filter by genre")
  .option("-p, --popular", "Show popular games")
  .option("-r, --recent", "Show recently released games")
  .option("-l, --limit <number>", "Number of results", "10")
  .action(
    async (options: {
      genre?: string;
      popular?: boolean;
      recent?: boolean;
      limit: string;
    }) => {
      try {
        const limit = parseInt(options.limit);
        let results;

        if (options.genre) {
          results = await igdb.getGamesByGenre(options.genre, limit);
        } else if (options.recent) {
          results = await igdb.getRecentGames(limit);
        } else {
          results = await igdb.getPopularGames(limit);
        }

        if (results.length === 0) {
          console.log("No games found.");
          return;
        }

        console.log(`\nDiscovered ${results.length} games:\n`);
        for (const game of results) {
          const year = game.releaseDate
            ? new Date(game.releaseDate * 1000).getFullYear()
            : "N/A";
          const rating = game.rating ? game.rating.toFixed(0) : "N/A";
          console.log(
            `[${game.igdbId}] ${game.name} (${year}) - Rating: ${rating}`,
          );
          if (game.genres.length > 0) {
            console.log(`    Genres: ${game.genres.join(", ")}`);
          }
        }
      } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
      }
    },
  );

/**
 * rec-log command - log a recommendation (for Claude Code to use)
 */
program
  .command("rec-log <igdbId>")
  .description("Log a game recommendation (for AI tracking)")
  .option("-c, --context <text>", "Context for why this was recommended")
  .action(async (igdbId: string, options: { context?: string }) => {
    try {
      const db = getDb();

      // ensure game is cached
      let game = getGameByIgdbId(db, parseInt(igdbId));
      if (!game) {
        const igdbGame = await igdb.getGameById(parseInt(igdbId));
        if (!igdbGame) {
          console.error("Game not found on IGDB.");
          process.exit(1);
        }
        const gameId = upsertGame(db, igdbGame);
        game = { ...igdbGame, id: gameId, createdAt: "", updatedAt: "" };
      }

      logRecommendation(db, game.id, options.context);
      console.log(`✓ Logged recommendation for "${game.name}"`);
      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * rec-respond command - respond to a recommendation
 */
program
  .command("rec-respond <logId> <response>")
  .description(
    "Respond to a recommendation (accepted, rejected, played, maybe_later)",
  )
  .action(async (logId: string, response: string) => {
    try {
      const validResponses = ["accepted", "rejected", "played", "maybe_later"];
      if (!validResponses.includes(response)) {
        console.error(
          `Invalid response. Must be one of: ${validResponses.join(", ")}`,
        );
        process.exit(1);
      }

      const db = getDb();
      updateRecommendationResponse(
        db,
        parseInt(logId),
        response as RecommendationResponse,
      );
      console.log(`✓ Response recorded`);
      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * rec-history command - show recommendation history
 */
program
  .command("rec-history")
  .description("Show recent recommendation history")
  .option("-l, --limit <number>", "Number of results", "20")
  .action(async (options: { limit: string }) => {
    try {
      const db = getDb();
      const recs = getRecentRecommendations(db, parseInt(options.limit));

      if (recs.length === 0) {
        console.log("No recommendations logged yet.");
        db.close();
        return;
      }

      console.log("\nRecent Recommendations:\n");
      for (const rec of recs) {
        const response = rec.response || "pending";
        console.log(
          `[${rec.id}] ${rec.game.name} - ${response} (${new Date(rec.recommendedAt).toLocaleDateString()})`,
        );
        if (rec.context) {
          console.log(`    Context: ${rec.context}`);
        }
      }

      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

/**
 * local-search command - search local database
 */
program
  .command("local-search <query>")
  .description("Search games in local database")
  .action(async (query: string) => {
    try {
      const db = getDb();
      const games = searchLocalGames(db, query);

      if (games.length === 0) {
        console.log("No games found in local database.");
        db.close();
        return;
      }

      console.log(`\nFound ${games.length} games locally:\n`);
      for (const game of games) {
        console.log(`[${game.igdbId}] ${game.name}`);
      }

      db.close();
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

program.parse();

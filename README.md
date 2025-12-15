# Backlogged

A personal game library and discovery app powered by IGDB, with Claude Code as your AI recommendation engine.

## What is this?

Backlogged solves the "AI recommendation loop" problem - where AI keeps suggesting games you've already played or rejected. By maintaining a local database of your gaming history, Claude Code can make informed recommendations based on what you actually like and haven't played yet.

## Features

- **Game Search**: Search IGDB's comprehensive database (covers, genres, themes, platforms, ratings)
- **Library Management**: Track games as played/playing/backlog/dropped with ratings and notes
- **Recommendation Memory**: Log AI suggestions and your responses so Claude never repeats itself
- **Custom Categories**: Create your own tags and lists
- **Claude Code Integration**: Use Claude Code CLI as your AI interface - it reads your DB directly

## Tech Stack

- TypeScript
- SQLite (via better-sqlite3)
- IGDB API (via Twitch)
- CLI-first (web UI planned for later)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure IGDB API

See [docs/api-setup.md](docs/api-setup.md) for detailed instructions on getting your Twitch/IGDB credentials.

Copy the example env file and add your credentials:

```bash
cp .env.example .env
# Edit .env with your TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET
```

### 3. Initialize the database

```bash
npm run db:init
```

### 4. Start using

```bash
# Search for a game
npm run cli search "dark souls"

# Add a game to your library
npm run cli add <game-id> --status played --rating 9

# View your library
npm run cli library

# Get recommendations (via Claude Code)
# Just ask Claude Code: "recommend me a game based on my library"
```

## Project Structure

```
backlogged/
├── docs/
│   └── api-setup.md          # IGDB/Twitch API setup guide
├── src/
│   ├── db/
│   │   ├── schema.ts         # SQLite schema definitions
│   │   └── index.ts          # Database connection and queries
│   ├── services/
│   │   └── igdb.ts           # IGDB API client
│   ├── cli/
│   │   └── index.ts          # CLI commands
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── data/
│   └── backlogged.db         # SQLite database (created on init)
├── .env                      # Your API credentials (not committed)
├── .env.example              # Example env file
└── package.json
```

## Using with Claude Code

The real magic happens when you use Claude Code as your AI interface. Since Claude Code can read and write to your SQLite database, you can have conversations like:

- "What roguelikes haven't I played yet?"
- "Recommend something like Hollow Knight but shorter"
- "Add Celeste to my backlog"
- "What did I rate higher than 8?"
- "I just finished Hades, mark it as played with a 9/10"

Claude Code will query your actual library and remember your preferences.

## License

MIT

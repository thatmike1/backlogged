# Backlogged - Claude Code Instructions

This is a personal game library and discovery app. Claude Code operates in two modes depending on what the user needs.

## Modes

### Development Mode (default)

Use this mode when the user wants to work on the codebase itself - adding features, fixing bugs, refactoring, etc.

Standard development workflow applies. Key files:
- `src/db/index.ts` - database operations
- `src/services/igdb.ts` - IGDB API client
- `src/cli/index.ts` - CLI commands
- `src/types/index.ts` - TypeScript types

### Library Mode

Activate this mode when the user wants to interact with their game library. Trigger phrases:
- "add [game] to my library"
- "I played [game]"
- "recommend me a game"
- "what's in my backlog"
- "rate [game]"
- "find me something like [game]"

In library mode, Claude acts as a game librarian/recommender with direct database access.

## Library Mode Workflow

### Adding Games

1. User mentions a game they played/want to add
2. Search IGDB: `npm run cli -- search "game name"`
3. Confirm the correct game with user (show IGDB ID)
4. Add to library: `npm run cli -- add <igdbId> --status <status> --rating <rating>`

Status options: `played`, `playing`, `backlog`, `dropped`, `wishlist`, `skipped`

Use `skipped` for games the user explicitly doesn't want to play - this prevents future recommendations.

### Batch Adding

When user lists multiple games, process them efficiently:
1. Search each game on IGDB
2. Present a summary: "Found: Game1 [id], Game2 [id], ..."
3. Ask for any ratings/statuses if not provided
4. Add all games

### Quick-Add Syntax

Users can list games casually with ratings inline:
> "Celeste 9.5, Outer Wilds 10, Disco Elysium 8"

Parse the game names and ratings, search IGDB, confirm matches, add all.

### Prompted Recall (Populate Library)

To help users remember games they've played, offer batches by genre or year:

1. **By genre**: Show top games in a genre
   ```bash
   npm run cli -- discover --genre "roguelike" --limit 15
   ```
   Ask: "Which of these have you played? Just list them with ratings, or say 'skip' for ones you're not interested in."

2. **By year**: Fetch notable games from specific years (use IGDB filters)
   Help jog memory: "Here are top games from 2020-2022..."

3. **Chain from played**: Show similar games to ones they enjoyed
   Look at `similar_games` field in their high-rated games

User responses:
- "played Celeste (9.5)" → add as played with rating
- "skip Fortnite" or "not interested in X" → add as skipped
- "want to play Y" → add to backlog
- No response = not tracked yet

### Recommendations

When recommending games:

1. First, check what the user has already played:
   ```bash
   npm run cli -- library
   ```

2. Check what was previously recommended (avoid repeats):
   ```bash
   npm run cli -- rec-history
   ```

3. Consider their preferences:
   - High-rated games in their library (genres/themes they like)
   - Games they dropped (genres/themes to maybe avoid)

4. Search IGDB for candidates:
   ```bash
   npm run cli -- discover --genre <genre>
   npm run cli -- search "<game name>"
   ```

5. Log recommendations made:
   ```bash
   npm run cli -- rec-log <igdbId> --context "reason for recommendation"
   ```

6. When user responds to a recommendation:
   ```bash
   npm run cli -- rec-respond <logId> <accepted|rejected|played|maybe_later>
   ```

### Querying Library

Useful queries to answer user questions:
```bash
npm run cli -- library                    # all games
npm run cli -- library -s backlog         # backlog only
npm run cli -- library -s played          # played games
npm run cli -- library -m 8               # highly rated (8+)
npm run cli -- library -q "souls"         # search by name
npm run cli -- stats                      # overall stats
npm run cli -- categories                 # list categories
```

## Database Direct Access

For complex queries not covered by CLI, read the SQLite database directly:
- Location: `data/backlogged.db`
- Can use Read tool to inspect or write custom SQL queries via Bash

Tables:
- `games` - cached IGDB game data
- `library` - user's game collection with status/rating/notes
- `categories` - custom tags
- `game_categories` - game-to-category mapping
- `recommendation_log` - AI recommendation history

## Important Notes

- Always confirm game identity before adding (IGDB has duplicates, remasters, etc.)
- Never recommend games already in user's library
- Check rec-history to avoid repeating rejected recommendations
- When user says "I played X", default status is `played` unless specified
- Preserve user's ratings/notes when updating entries

## Issue Tracking with Beads (bd)

This project uses beads (`bd`) for issue tracking instead of markdown files. Use the local `bd` CLI directly via bash - never use MCP tools for beads operations.

### Why Beads

- dependency-aware issue tracking (issues chained like beads)
- persists across compaction cycles via git-backed JSONL
- agents can query ready work and orient themselves quickly
- automatically file issues for discovered work as you go

### Key Commands

```bash
bd list                     # list all issues
bd list --status open       # filter by status (open, in_progress, blocked, closed)
bd ready                    # show issues ready to work on (no blockers)
bd show <issue-id>          # show issue details
bd create "title" -t task   # create issue (-t: bug, feature, task, epic, chore)
bd update <id> --status in_progress
bd close <id> --reason "done"
bd dep add <id> <blocker-id>  # add dependency
bd stats                    # project statistics
```

### Workflow

1. **starting work**: run `bd ready` to find unblocked issues
2. **claim work**: `bd update <id> --status in_progress`
3. **discover related work**: create new issues with `bd create`, link with `bd dep add`
4. **complete work**: `bd close <id> --reason "description"`

### Priority Levels

- 0 = highest (critical)
- 1 = high
- 2 = medium (default)
- 3 = low
- 4 = lowest

### Database Location

- `.beads/` directory contains the SQLite database
- auto-syncs with `.beads/issues.jsonl` (committed to git)
- no manual export/import needed

import { cn } from "../../lib/utils";
import { GameCard } from "./game-card";
import { Skeleton } from "../ui/skeleton";
import type { GameStatus } from "../../lib/api";

interface GameGridItem {
  igdbId: number;
  name: string;
  coverUrl: string | null;
  releaseDate: number | null;
  genres: string[];
  status?: GameStatus;
  userRating?: number | null;
}

interface GameGridProps {
  games: GameGridItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * responsive grid of game cards
 */
export function GameGrid({
  games,
  loading = false,
  emptyMessage = "No games found",
  className,
}: GameGridProps) {
  // show skeletons while loading
  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
          className,
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // show empty state
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <p className="font-display text-xl text-text-secondary dark:text-stone-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // render game grid
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
        className,
      )}
    >
      {games.map((game) => (
        <GameCard
          key={game.igdbId}
          igdbId={game.igdbId}
          name={game.name}
          coverUrl={game.coverUrl}
          releaseYear={
            game.releaseDate
              ? new Date(game.releaseDate * 1000).getFullYear()
              : null
          }
          genres={game.genres}
          status={game.status}
          userRating={game.userRating}
        />
      ))}
    </div>
  );
}

/**
 * skeleton loader for game card
 */
function GameCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-800 border-3 border-black dark:border-stone-600 rounded-lg overflow-hidden shadow-brutal-md">
      <Skeleton className="aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-12 rounded-sm" />
          <Skeleton className="h-6 w-16 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

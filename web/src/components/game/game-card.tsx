import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import type { GameStatus } from "../../lib/api";

interface GameCardProps {
  igdbId: number;
  name: string;
  coverUrl: string | null;
  releaseYear: number | null;
  genres: string[];
  status?: GameStatus;
  userRating?: number | null;
  className?: string;
}

/**
 * game card component displaying cover, title, and status
 */
export function GameCard({
  igdbId,
  name,
  coverUrl,
  releaseYear,
  genres,
  status,
  userRating,
  className,
}: GameCardProps) {
  // convert IGDB cover URL to larger size
  const coverImage = coverUrl
    ? coverUrl.replace("t_thumb", "t_cover_big")
    : null;

  return (
    <Link
      to={`/game/${igdbId}`}
      className={cn(
        "group block bg-white dark:bg-stone-800",
        "border-3 border-black dark:border-stone-200",
        "rounded-lg overflow-hidden",
        "shadow-brutal-md",
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "hover:shadow-brutal-hover",
        "active:translate-x-[1px] active:translate-y-[1px]",
        "active:shadow-brutal-active",
        "transition-all duration-150 ease-out",
        className,
      )}
    >
      {/* cover image */}
      <div className="aspect-[3/4] bg-stone-100 dark:bg-stone-700 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${name} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <span className="font-display text-4xl">?</span>
          </div>
        )}
      </div>

      {/* card content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-text-primary dark:text-stone-100 line-clamp-2">
          {name}
        </h3>
        <p className="font-body text-text-secondary dark:text-stone-400 text-sm mt-1">
          {releaseYear || "TBA"} {genres.length > 0 && `| ${genres[0]}`}
        </p>

        {/* badges row */}
        {(userRating !== undefined || status) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {userRating !== null && userRating !== undefined && (
              <Badge variant="default" className="bg-accent-yellow">
                {userRating.toFixed(1)}
              </Badge>
            )}
            {status && <Badge variant={status}>{formatStatus(status)}</Badge>}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * format status for display
 */
function formatStatus(status: GameStatus): string {
  const statusMap: Record<GameStatus, string> = {
    played: "Played",
    playing: "Playing",
    backlog: "Backlog",
    dropped: "Dropped",
    wishlist: "Wishlist",
    skipped: "Skipped",
  };
  return statusMap[status];
}

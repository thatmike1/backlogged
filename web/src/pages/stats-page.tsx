import {
  Trophy,
  Gamepad2,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useLibraryStats, useLibrary } from "../hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "../components/ui";
import { Skeleton } from "../components/ui/skeleton";
import type { GameStatus } from "../lib/api";
import { cn } from "../lib/utils";

const STATUS_CONFIG: Record<
  GameStatus,
  { label: string; color: string; bgColor: string }
> = {
  played: {
    label: "Played",
    color: "text-status-played",
    bgColor: "bg-status-played",
  },
  playing: {
    label: "Playing",
    color: "text-status-playing",
    bgColor: "bg-status-playing",
  },
  backlog: {
    label: "Backlog",
    color: "text-status-backlog",
    bgColor: "bg-status-backlog",
  },
  dropped: {
    label: "Dropped",
    color: "text-status-dropped",
    bgColor: "bg-status-dropped",
  },
  wishlist: {
    label: "Wishlist",
    color: "text-status-wishlist",
    bgColor: "bg-status-wishlist",
  },
  skipped: {
    label: "Skipped",
    color: "text-status-skipped",
    bgColor: "bg-status-skipped",
  },
};

/**
 * stats page - displays library statistics and insights
 */
export default function StatsPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useLibraryStats();
  const { data: games, isLoading: gamesLoading } = useLibrary();

  const isLoading = statsLoading || gamesLoading;

  // calculate additional stats from games
  const topRatedGames =
    games
      ?.filter((g) => g.rating !== null && g.rating >= 8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5) || [];

  const recentGames =
    games
      ?.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-accent-coral font-semibold">
            Failed to load stats: {statsError.message}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-text-primary dark:text-stone-100">
          Your Stats
        </h1>
        <p className="mt-2 text-text-secondary dark:text-stone-400">
          Gaming insights and achievements
        </p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Gamepad2 className="w-6 h-6" />}
          value={stats?.totalGames || 0}
          label="Total Games"
          color="text-primary"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          value={stats?.byStatus?.played || 0}
          label="Completed"
          color="text-status-played"
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          value={stats?.averageRating?.toFixed(1) || "N/A"}
          label="Avg Rating"
          color="text-accent-yellow"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          value={stats?.totalHoursPlayed || 0}
          label="Hours Played"
          color="text-status-playing"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Games by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.byStatus && (
              <div className="space-y-4">
                {(Object.entries(stats.byStatus) as [GameStatus, number][])
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const config = STATUS_CONFIG[status];
                    const percentage = stats.totalGames
                      ? Math.round((count / stats.totalGames) * 100)
                      : 0;

                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm text-text-primary dark:text-stone-100">
                            {config.label}
                          </span>
                          <span className="text-sm text-text-secondary dark:text-stone-400">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden border-2 border-black">
                          <div
                            className={cn(
                              "h-full transition-all",
                              config.bgColor,
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                {Object.values(stats.byStatus).every((v) => v === 0) && (
                  <p className="text-center text-text-secondary dark:text-stone-400 py-4">
                    No games in your library yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* top genres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topGenres && stats.topGenres.length > 0 ? (
              <div className="space-y-3">
                {stats.topGenres.slice(0, 6).map((genre, index) => (
                  <div key={genre.genre} className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium text-text-primary dark:text-stone-100">
                      {genre.genre}
                    </span>
                    <Badge variant="default">{genre.count} games</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary dark:text-stone-400 py-4">
                Not enough data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* top rated games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Your Top Rated
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRatedGames.length > 0 ? (
              <div className="space-y-3">
                {topRatedGames.map((game, index) => (
                  <a
                    key={game.id}
                    href={`/game/${game.igdbId}`}
                    className="flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-700 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-accent-yellow/20 text-accent-yellow rounded font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium line-clamp-1 text-text-primary dark:text-stone-100">
                      {game.name}
                    </span>
                    <Badge
                      variant="default"
                      className="bg-accent-yellow text-black"
                    >
                      {game.rating?.toFixed(1)}
                    </Badge>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary dark:text-stone-400 py-4">
                Rate some games to see your top picks!
              </p>
            )}
          </CardContent>
        </Card>

        {/* recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <a
                    key={game.id}
                    href={`/game/${game.igdbId}`}
                    className="flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-700 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <span className="flex-1 font-medium line-clamp-1 text-text-primary dark:text-stone-100">
                      {game.name}
                    </span>
                    <Badge variant={game.status}>{game.status}</Badge>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary dark:text-stone-400 py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * stat card component
 */
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={cn("mb-2", color)}>{icon}</div>
        <p className="text-3xl font-display font-bold text-text-primary dark:text-stone-100">
          {value}
        </p>
        <p className="text-sm text-text-secondary dark:text-stone-400">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

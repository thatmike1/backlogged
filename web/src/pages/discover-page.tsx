import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Sparkles,
  TrendingUp,
  Gamepad2,
  Plus,
  Check,
} from "lucide-react";
import {
  useIgdbSearch,
  useIgdbDiscover,
  useLibrary,
  useAddToLibrary,
} from "../hooks";
import { Input, Button, Card, CardContent, Badge } from "../components/ui";
import { Skeleton } from "../components/ui/skeleton";
import type { GameStatus, IgdbGame } from "../lib/api";
import { cn } from "../lib/utils";

type DiscoverTab = "search" | "popular" | "genres";

const GENRE_OPTIONS = [
  "Role-playing (RPG)",
  "Adventure",
  "Shooter",
  "Platform",
  "Puzzle",
  "Strategy",
  "Indie",
  "Simulator",
  "Sport",
  "Racing",
];

/**
 * discover page - browse and search for new games
 */
export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<DiscoverTab>(
    searchParams.get("q") ? "search" : "popular",
  );
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(
    searchParams.get("genre") || undefined,
  );

  // get library to check what games are already added
  const { data: libraryGames } = useLibrary();
  const libraryIgdbIds = new Set(libraryGames?.map((g) => g.igdbId) || []);

  // search query
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useIgdbSearch(
    searchQuery,
    activeTab === "search" && searchQuery.length >= 2,
  );

  // discover/popular games
  const {
    data: discoverResults,
    isLoading: discoverLoading,
    error: discoverError,
  } = useIgdbDiscover(
    {
      genre: selectedGenre,
      minRating: 70,
      limit: 24,
    },
    activeTab !== "search",
  );

  const addToLibrary = useAddToLibrary();

  /**
   * handles search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      setActiveTab("search");
      setSearchParams({ q: searchQuery });
    }
  };

  /**
   * handles genre selection
   */
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? undefined : genre);
    setActiveTab("genres");
    const params = new URLSearchParams();
    if (genre !== selectedGenre) {
      params.set("genre", genre);
    }
    setSearchParams(params);
  };

  /**
   * quick add game to library
   */
  const handleQuickAdd = (igdbId: number, status: GameStatus) => {
    addToLibrary.mutate({ igdbId, status });
  };

  const isLoading = activeTab === "search" ? searchLoading : discoverLoading;
  const error = activeTab === "search" ? searchError : discoverError;
  const games = activeTab === "search" ? searchResults : discoverResults;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-text-primary dark:text-stone-100">
          Discover Games
        </h1>
        <p className="mt-2 text-text-secondary dark:text-stone-400">
          Search IGDB or browse popular titles
        </p>
      </div>

      {/* search bar */}
      <Card className="mb-6 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={searchQuery.length < 2}
          >
            Search
          </Button>
        </form>
      </Card>

      {/* tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "popular" ? "primary" : "ghost"}
          onClick={() => {
            setActiveTab("popular");
            setSearchParams({});
          }}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Popular
        </Button>
        <Button
          variant={activeTab === "genres" ? "primary" : "ghost"}
          onClick={() => setActiveTab("genres")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          By Genre
        </Button>
        {searchQuery && (
          <Button
            variant={activeTab === "search" ? "primary" : "ghost"}
            onClick={() => setActiveTab("search")}
          >
            <Search className="w-4 h-4 mr-2" />
            Results
          </Button>
        )}
      </div>

      {/* genre selector */}
      {activeTab === "genres" && (
        <div className="flex flex-wrap gap-2 mb-6">
          {GENRE_OPTIONS.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleGenreSelect(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      )}

      {/* error state */}
      {error && (
        <Card className="p-6 text-center">
          <p className="text-accent-coral font-semibold">
            Failed to load games: {error.message}
          </p>
        </Card>
      )}

      {/* loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <Skeleton className="w-20 h-28 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* results */}
      {!isLoading && !error && games && (
        <>
          {games.length === 0 ? (
            <Card className="p-8 text-center">
              <Gamepad2 className="w-16 h-16 mx-auto text-stone-300 mb-4" />
              <p className="font-display text-xl text-text-secondary">
                {activeTab === "search"
                  ? "No games found for your search"
                  : "No games found"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameDiscoverCard
                  key={game.id}
                  game={game}
                  isInLibrary={libraryIgdbIds.has(game.id)}
                  onQuickAdd={handleQuickAdd}
                  isAdding={addToLibrary.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * game card for discover page with quick-add buttons
 */
function GameDiscoverCard({
  game,
  isInLibrary,
  onQuickAdd,
  isAdding,
}: {
  game: IgdbGame;
  isInLibrary: boolean;
  onQuickAdd: (igdbId: number, status: GameStatus) => void;
  isAdding: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  const coverImage = game.coverUrl
    ? game.coverUrl.replace("t_thumb", "t_cover_small")
    : null;

  const releaseYear = game.releaseDate
    ? new Date(game.releaseDate).getFullYear()
    : null;

  return (
    <Card
      hoverable
      className={cn("relative", isInLibrary && "ring-2 ring-status-played")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* cover */}
          <a href={`/game/${game.id}`} className="shrink-0">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${game.name} cover`}
                className="w-20 h-28 object-cover rounded border-2 border-black"
              />
            ) : (
              <div className="w-20 h-28 bg-stone-100 dark:bg-stone-700 rounded border-2 border-black flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-stone-400" />
              </div>
            )}
          </a>

          {/* info */}
          <div className="flex-1 min-w-0">
            <a href={`/game/${game.id}`}>
              <h3 className="font-display font-semibold text-text-primary dark:text-stone-100 line-clamp-2 hover:text-primary">
                {game.name}
              </h3>
            </a>
            <p className="text-sm text-text-secondary dark:text-stone-400 mt-1">
              {releaseYear || "TBA"}
              {game.genres && game.genres.length > 0 && ` • ${game.genres[0]}`}
            </p>
            {game.rating && (
              <p className="text-sm text-text-secondary mt-1">
                IGDB: {(game.rating / 10).toFixed(1)}/10
              </p>
            )}

            {/* in library badge */}
            {isInLibrary && (
              <Badge variant="played" className="mt-2">
                <Check className="w-3 h-3 mr-1" />
                In Library
              </Badge>
            )}
          </div>
        </div>

        {/* quick add actions */}
        {!isInLibrary && showActions && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-stone-800 pt-8">
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="success"
                onClick={() => onQuickAdd(game.id, "playing")}
                disabled={isAdding}
              >
                <Plus className="w-4 h-4 mr-1" />
                Playing
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onQuickAdd(game.id, "backlog")}
                disabled={isAdding}
              >
                Backlog
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

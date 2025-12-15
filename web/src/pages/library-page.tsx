import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, LayoutGrid, List } from "lucide-react";
import { useLibrary } from "../hooks";
import { GameGrid } from "../components/game/game-grid";
import { Input, Button, Badge, Card } from "../components/ui";
import { StatusSelect } from "../components/game/status-select";
import type { GameStatus } from "../lib/api";

/**
 * library page - displays user's game collection with filtering
 */
export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const statusFilter = (searchParams.get("status") as GameStatus) || undefined;
  const minRating = searchParams.get("minRating")
    ? Number(searchParams.get("minRating"))
    : undefined;

  const {
    data: games,
    isLoading,
    error,
  } = useLibrary({
    status: statusFilter,
    minRating,
    query: searchQuery || undefined,
  });

  /**
   * updates the status filter in URL params
   */
  const handleStatusChange = (status: GameStatus | "") => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    setSearchParams(params);
  };

  /**
   * handles search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  /**
   * clears all filters
   */
  const clearFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const hasFilters = statusFilter || minRating || searchQuery;

  // transform library data for the grid
  const gridGames =
    games?.map((game) => ({
      igdbId: game.igdbId,
      name: game.name,
      coverUrl: game.coverUrl,
      releaseDate: null,
      genres: [],
      status: game.status,
      userRating: game.rating,
    })) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-text-primary dark:text-stone-100">
          My Library
        </h1>
        <p className="mt-2 text-text-secondary dark:text-stone-400">
          {games?.length || 0} games in your collection
        </p>
      </div>

      {/* filters bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          {/* status filter */}
          <div className="w-full md:w-48">
            <StatusSelect
              value={statusFilter || ""}
              onChange={handleStatusChange}
              includeEmpty
            />
          </div>

          {/* view toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* active filters */}
        {hasFilters && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {statusFilter && (
              <Badge variant={statusFilter}>{statusFilter}</Badge>
            )}
            {minRating && <Badge variant="default">Rating {minRating}+</Badge>}
            {searchQuery && <Badge variant="default">"{searchQuery}"</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* error state */}
      {error && (
        <Card className="p-6 text-center">
          <p className="text-accent-coral font-semibold">
            Failed to load library: {error.message}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </Card>
      )}

      {/* game grid */}
      {!error && (
        <GameGrid
          games={gridGames}
          loading={isLoading}
          emptyMessage={
            hasFilters
              ? "No games match your filters"
              : "Your library is empty. Discover games to add!"
          }
        />
      )}
    </div>
  );
}

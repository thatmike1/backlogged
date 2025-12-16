import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Gamepad2,
  Tag,
  Clock,
  Trash2,
} from "lucide-react";
import {
  useIgdbGame,
  useLibrary,
  useAddToLibrary,
  useUpdateLibrary,
  useRemoveFromLibrary,
} from "../hooks";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Rating,
  Textarea,
  Modal,
} from "../components/ui";
import { StatusButtonGroup } from "../components/game/status-select";
import { Skeleton } from "../components/ui/skeleton";
import type { GameStatus } from "../lib/api";

/**
 * game page - displays details for a single game
 */
export default function GamePage() {
  const { igdbId } = useParams<{ igdbId: string }>();
  const navigate = useNavigate();
  const igdbIdNum = igdbId ? parseInt(igdbId, 10) : null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [hasNotesChanged, setHasNotesChanged] = useState(false);

  // fetch game data from IGDB
  const {
    data: igdbGame,
    isLoading: igdbLoading,
    error: igdbError,
  } = useIgdbGame(igdbIdNum);

  // fetch library data to check if game is in library
  const { data: libraryGames } = useLibrary();
  const libraryEntry = libraryGames?.find((g) => g.igdbId === igdbIdNum);
  const isInLibrary = !!libraryEntry;

  // mutations
  const addToLibrary = useAddToLibrary();
  const updateLibrary = useUpdateLibrary();
  const removeFromLibrary = useRemoveFromLibrary();

  // initialize notes from library entry
  useEffect(() => {
    if (libraryEntry?.notes && !hasNotesChanged) {
      setNotes(libraryEntry.notes);
    }
  }, [libraryEntry?.notes, hasNotesChanged]);

  /**
   * adds game to library with a status
   */
  const handleAddToLibrary = (status: GameStatus) => {
    if (!igdbIdNum) return;
    addToLibrary.mutate({ igdbId: igdbIdNum, status });
  };

  /**
   * updates game status
   */
  const handleStatusChange = (status: GameStatus) => {
    if (!libraryEntry) {
      handleAddToLibrary(status);
      return;
    }
    updateLibrary.mutate({ gameId: libraryEntry.id, updates: { status } });
  };

  /**
   * updates game rating
   */
  const handleRatingChange = (rating: number) => {
    if (!libraryEntry) return;
    updateLibrary.mutate({ gameId: libraryEntry.id, updates: { rating } });
  };

  /**
   * saves notes
   */
  const handleSaveNotes = () => {
    if (!libraryEntry) return;
    updateLibrary.mutate(
      { gameId: libraryEntry.id, updates: { notes: notes || null } },
      { onSuccess: () => setHasNotesChanged(false) },
    );
  };

  /**
   * removes game from library
   */
  const handleRemove = () => {
    if (!libraryEntry) return;
    removeFromLibrary.mutate(libraryEntry.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigate("/");
      },
    });
  };

  // format release date
  const releaseYear = igdbGame?.releaseDate
    ? new Date(igdbGame.releaseDate).getFullYear()
    : null;

  // get cover image
  const coverImage = igdbGame?.coverUrl
    ? igdbGame.coverUrl.replace("t_thumb", "t_cover_big_2x")
    : null;

  if (igdbLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (igdbError || !igdbGame) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
        <Card className="p-8 text-center">
          <p className="text-xl font-display text-accent-coral">
            Game not found
          </p>
          <p className="mt-2 text-text-secondary dark:text-stone-400">
            We couldn't find this game. It may have been removed from IGDB.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate("/")}
          >
            Return to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </Link>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* cover image */}
        <div>
          <Card className="overflow-hidden">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${igdbGame.name} cover`}
                className="w-full aspect-[3/4] object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                <Gamepad2 className="w-16 h-16 text-stone-400" />
              </div>
            )}
          </Card>

          {/* quick add buttons for non-library games */}
          {!isInLibrary && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-text-secondary dark:text-stone-400">
                Add to library:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleAddToLibrary("playing")}
                  disabled={addToLibrary.isPending}
                >
                  Playing
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddToLibrary("backlog")}
                  disabled={addToLibrary.isPending}
                >
                  Backlog
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddToLibrary("wishlist")}
                  disabled={addToLibrary.isPending}
                >
                  Wishlist
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* game info */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary dark:text-stone-100">
            {igdbGame.name}
          </h1>

          {/* metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-text-secondary dark:text-stone-400">
            {releaseYear && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {releaseYear}
              </span>
            )}
            {igdbGame.platforms && igdbGame.platforms.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" />
                {igdbGame.platforms.slice(0, 3).join(", ")}
                {igdbGame.platforms.length > 3 &&
                  ` +${igdbGame.platforms.length - 3}`}
              </span>
            )}
            {igdbGame.rating && (
              <span className="flex items-center gap-1.5">
                IGDB: {(igdbGame.rating / 10).toFixed(1)}/10
              </span>
            )}
          </div>

          {/* genres */}
          {igdbGame.genres && igdbGame.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {igdbGame.genres.map((genre) => (
                <Badge key={genre} variant="default">
                  <Tag className="w-3 h-3 mr-1" />
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* summary */}
          {igdbGame.summary && (
            <p className="mt-6 text-text-secondary dark:text-stone-300 leading-relaxed">
              {igdbGame.summary}
            </p>
          )}

          {/* library status section */}
          {isInLibrary && (
            <Card className="mt-8">
              <CardContent className="space-y-6">
                {/* status */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary dark:text-stone-400 mb-2">
                    Status
                  </label>
                  <StatusButtonGroup
                    value={libraryEntry.status}
                    onChange={handleStatusChange}
                  />
                </div>

                {/* rating */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary dark:text-stone-400 mb-2">
                    Your Rating
                  </label>
                  <Rating
                    value={libraryEntry.rating || 0}
                    onChange={handleRatingChange}
                    size="lg"
                  />
                </div>

                {/* hours played */}
                {libraryEntry.hoursPlayed && (
                  <div className="flex items-center gap-2 text-text-secondary dark:text-stone-400">
                    <Clock className="w-4 h-4" />
                    <span>{libraryEntry.hoursPlayed} hours played</span>
                  </div>
                )}

                {/* notes */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary dark:text-stone-400 mb-2">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Add personal notes about this game..."
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setHasNotesChanged(true);
                    }}
                  />
                  {hasNotesChanged && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={handleSaveNotes}
                      disabled={updateLibrary.isPending}
                    >
                      Save Notes
                    </Button>
                  )}
                </div>

                {/* remove button */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove from Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove from Library?"
      >
        <p className="text-text-secondary dark:text-stone-400 mb-6">
          Are you sure you want to remove <strong>{igdbGame.name}</strong> from
          your library? This will delete your rating, notes, and play history.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRemove}
            disabled={removeFromLibrary.isPending}
          >
            {removeFromLibrary.isPending ? "Removing..." : "Remove"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

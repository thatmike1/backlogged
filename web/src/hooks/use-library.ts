import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { library, stats, type GameStatus } from "../lib/api";

interface LibraryFilters {
  status?: GameStatus;
  minRating?: number;
  query?: string;
}

/**
 * hook for fetching library data
 */
export function useLibrary(filters?: LibraryFilters) {
  return useQuery({
    queryKey: ["library", filters],
    queryFn: () => library.getAll(filters),
  });
}

/**
 * hook for adding a game to the library
 */
export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      igdbId,
      status,
      rating,
      notes,
    }: {
      igdbId: number;
      status: GameStatus;
      rating?: number;
      notes?: string;
    }) => library.add({ igdbId, status, rating, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/**
 * hook for updating a library entry
 */
export function useUpdateLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      updates,
    }: {
      gameId: number;
      updates: {
        status?: GameStatus;
        rating?: number | null;
        notes?: string | null;
        hoursPlayed?: number | null;
      };
    }) => library.update(gameId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/**
 * hook for removing a game from the library
 */
export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: number) => library.remove(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/**
 * hook for fetching library stats
 */
export function useLibraryStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => stats.get(),
  });
}

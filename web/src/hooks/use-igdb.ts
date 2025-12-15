import { useQuery } from "@tanstack/react-query";
import { igdb } from "../lib/api";

/**
 * hook for searching IGDB
 */
export function useIgdbSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["igdb", "search", query],
    queryFn: () => igdb.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * hook for fetching a game from IGDB
 */
export function useIgdbGame(igdbId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["igdb", "game", igdbId],
    queryFn: () => igdb.getGame(igdbId!),
    enabled: enabled && igdbId !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * hook for discovering games from IGDB
 */
export function useIgdbDiscover(
  options?: {
    genre?: string;
    platform?: string;
    minRating?: number;
    limit?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ["igdb", "discover", options],
    queryFn: () => igdb.discover(options),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

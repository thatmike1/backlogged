import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categories } from "../lib/api";

/**
 * hook for fetching categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categories.getAll(),
  });
}

/**
 * hook for creating a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      categories.create({ name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/**
 * hook for adding a game to a category
 */
export function useAddToCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      categoryId,
    }: {
      gameId: number;
      categoryId: number;
    }) => categories.addGame(categoryId, gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

/**
 * hook for removing a game from a category
 */
export function useRemoveFromCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      categoryId,
    }: {
      gameId: number;
      categoryId: number;
    }) => categories.removeGame(categoryId, gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

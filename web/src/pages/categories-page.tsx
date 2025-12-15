import { useState } from "react";
import { Folder, Plus } from "lucide-react";
import { useCategories, useCreateCategory } from "../hooks";
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Input,
  Modal,
  Badge,
} from "../components/ui";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import type { Category } from "../lib/api";

const COLOR_OPTIONS = [
  { name: "Purple", value: "#7C3AED" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
];

/**
 * categories page - manage custom game categories
 */
export default function CategoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(
    COLOR_OPTIONS[0].value,
  );

  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();

  /**
   * handles creating a new category
   */
  const handleCreate = () => {
    if (!newCategoryName.trim()) return;

    createCategory.mutate(
      { name: newCategoryName.trim(), color: newCategoryColor },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewCategoryName("");
          setNewCategoryColor(COLOR_OPTIONS[0].value);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-accent-coral font-semibold">
            Failed to load categories: {error.message}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-text-primary dark:text-stone-100">
            Categories
          </h1>
          <p className="mt-2 text-text-secondary dark:text-stone-400">
            Organize your games with custom tags
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* categories grid */}
      {categories && categories.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Folder className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="font-display text-xl text-text-secondary mb-2">
            No categories yet
          </p>
          <p className="text-text-muted mb-4">
            Create categories to organize your games
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first category
          </Button>
        </Card>
      )}

      {/* create category modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Name
            </label>
            <Input
              placeholder="e.g., Favorites, To Replay, Couch Co-op..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewCategoryColor(color.value)}
                  className={cn(
                    "w-8 h-8 rounded-md border-2 transition-all",
                    newCategoryColor === color.value
                      ? "border-black scale-110 shadow-brutal-sm"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* preview */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Preview
            </label>
            <Badge
              variant="default"
              className="text-white"
              style={{ backgroundColor: newCategoryColor }}
            >
              {newCategoryName || "Category Name"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!newCategoryName.trim() || createCategory.isPending}
          >
            {createCategory.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/**
 * individual category card
 */
function CategoryCard({ category }: { category: Category }) {
  return (
    <Card hoverable className="overflow-hidden">
      {/* color bar */}
      <div className="h-2" style={{ backgroundColor: category.color }} />

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Folder className="w-5 h-5" style={{ color: category.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-text-primary dark:text-stone-100 truncate">
              {category.name}
            </h3>
            <p className="text-sm text-text-secondary dark:text-stone-400">
              {category.gameCount} {category.gameCount === 1 ? "game" : "games"}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t-0">
        <Button variant="ghost" size="sm" className="w-full">
          View Games
        </Button>
      </CardFooter>
    </Card>
  );
}

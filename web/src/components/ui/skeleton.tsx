import { cn } from "../../lib/utils";

export interface SkeletonProps {
  /** additional class names for sizing and shape */
  className?: string;
}

/**
 * animated loading placeholder with pulse animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-stone-200 dark:bg-stone-700",
        "animate-pulse",
        "rounded-md",
        className,
      )}
      aria-hidden="true"
      role="presentation"
    />
  );
}

/**
 * skeleton for game card loading state
 */
export function GameCardSkeleton() {
  return (
    <div className="border-3 border-black rounded-lg shadow-[5px_5px_0_#000] bg-white dark:bg-bg-dark-elevated overflow-hidden">
      {/* cover image placeholder */}
      <Skeleton className="w-full aspect-[3/4] rounded-none" />

      {/* content */}
      <div className="p-4 space-y-3">
        {/* title */}
        <Skeleton className="h-6 w-3/4" />

        {/* rating */}
        <Skeleton className="h-4 w-1/3" />

        {/* badge */}
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

/**
 * skeleton for text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-3 border-black rounded-lg shadow-[3px_3px_0_#000] bg-white dark:bg-bg-dark-elevated">
      {/* thumbnail */}
      <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />

      {/* content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* action */}
      <Skeleton className="w-8 h-8 rounded-md" />
    </div>
  );
}

import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** badge style variant mapped to game status colors */
  variant?:
    | "default"
    | "played"
    | "playing"
    | "backlog"
    | "dropped"
    | "wishlist"
    | "skipped";
}

/**
 * neubrutalist badge component for displaying game status
 */
export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = [
    "inline-flex items-center",
    "px-2.5 py-0.5",
    "text-xs font-semibold font-body",
    "border-2 border-black dark:border-stone-600",
    "rounded-sm",
    "shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#44403c]",
  ];

  const variantStyles = {
    default: "bg-stone-100 text-black dark:bg-stone-700 dark:text-white",
    played: "bg-status-played text-black",
    playing: "bg-status-playing text-black",
    backlog: "bg-status-backlog text-black",
    dropped: "bg-status-dropped text-black",
    wishlist: "bg-status-wishlist text-black",
    skipped: "bg-status-skipped text-white",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

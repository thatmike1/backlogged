import { cn } from "../../lib/utils";
import type { GameStatus } from "../../lib/api";

interface StatusSelectProps {
  value: GameStatus | "";
  onChange: (status: GameStatus) => void;
  includeEmpty?: boolean;
  className?: string;
}

const STATUS_OPTIONS: Array<{
  value: GameStatus;
  label: string;
  color: string;
}> = [
  { value: "playing", label: "Playing", color: "bg-status-playing" },
  { value: "played", label: "Played", color: "bg-status-played" },
  { value: "backlog", label: "Backlog", color: "bg-status-backlog" },
  { value: "wishlist", label: "Wishlist", color: "bg-status-wishlist" },
  { value: "dropped", label: "Dropped", color: "bg-status-dropped" },
  { value: "skipped", label: "Skipped", color: "bg-status-skipped" },
];

/**
 * select component for game status
 */
export function StatusSelect({
  value,
  onChange,
  includeEmpty = false,
  className,
}: StatusSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as GameStatus)}
        className={cn(
          "w-full appearance-none cursor-pointer",
          "px-4 py-3 pr-10",
          "font-body text-text-primary dark:text-stone-100",
          "bg-white dark:bg-stone-800",
          "border-3 border-black dark:border-stone-600",
          "rounded-md",
          "shadow-brutal-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-all duration-150",
        )}
      >
        {includeEmpty && <option value="">Select status...</option>}
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5 text-text-secondary dark:text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * status button group for inline selection
 */
export function StatusButtonGroup({
  value,
  onChange,
  className,
}: Omit<StatusSelectProps, "includeEmpty">) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5",
            "font-body font-semibold text-sm",
            "border-2 border-black dark:border-stone-600",
            "rounded-sm",
            "transition-all duration-150",
            value === option.value
              ? cn(
                  option.color,
                  "text-black shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#44403c]",
                )
              : "bg-white dark:bg-stone-800 text-text-secondary dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

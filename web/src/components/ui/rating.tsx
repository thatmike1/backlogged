import { useState, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

export interface RatingProps {
  /** rating value from 0-10 */
  value: number;
  /** callback when rating changes (makes component interactive) */
  onChange?: (value: number) => void;
  /** display only mode */
  readonly?: boolean;
  /** component size */
  size?: "sm" | "md" | "lg";
}

/**
 * interactive star rating component (0-10 scale displayed as 5 stars with half-star precision)
 */
export function Rating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = !readonly && onChange;
  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeStyles = {
    sm: { star: "w-4 h-4", gap: "gap-0.5" },
    md: { star: "w-5 h-5", gap: "gap-1" },
    lg: { star: "w-6 h-6", gap: "gap-1.5" },
  };

  /**
   * converts 0-10 scale to 0-5 stars
   */
  const getStarFill = (starIndex: number): "full" | "half" | "empty" => {
    const starValue = (displayValue / 10) * 5;
    if (starIndex < Math.floor(starValue)) return "full";
    if (starIndex < starValue) return "half";
    return "empty";
  };

  /**
   * handles click on star to set rating
   */
  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!isInteractive) return;
    // convert star index to 0-10 scale
    const newValue = isHalf ? (starIndex + 0.5) * 2 : (starIndex + 1) * 2;
    onChange(newValue);
  };

  /**
   * handles hover to preview rating
   */
  const handleMouseMove = (
    starIndex: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isInteractive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isHalf = event.clientX - rect.left < rect.width / 2;
    const previewValue = isHalf ? (starIndex + 0.5) * 2 : (starIndex + 1) * 2;
    setHoverValue(previewValue);
  };

  /**
   * handles keyboard navigation
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isInteractive) return;

    const step = 1; // 0.5 stars = 1 on 0-10 scale
    let newValue = value;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        newValue = Math.min(10, value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        newValue = Math.max(0, value - step);
        break;
      case "Home":
        newValue = 0;
        break;
      case "End":
        newValue = 10;
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(newValue);
  };

  return (
    <div
      className={cn("inline-flex items-center", sizeStyles[size].gap)}
      role="slider"
      aria-label="Rating"
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={value}
      aria-valuetext={`${value} out of 10`}
    >
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const fill = getStarFill(starIndex);

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!isInteractive}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const isHalf = e.clientX - rect.left < rect.width / 2;
              handleClick(starIndex, isHalf);
            }}
            onMouseMove={(e) => handleMouseMove(starIndex, e)}
            onMouseLeave={() => setHoverValue(null)}
            onKeyDown={handleKeyDown}
            className={cn(
              "relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm",
              isInteractive &&
                "cursor-pointer hover:scale-110 transition-transform",
              !isInteractive && "cursor-default",
            )}
            aria-label={`Rate ${(starIndex + 1) * 2} out of 10`}
            tabIndex={isInteractive ? 0 : -1}
          >
            {/* empty star background */}
            <Star
              className={cn(
                sizeStyles[size].star,
                "text-stone-300 dark:text-stone-600",
              )}
            />
            {/* filled star overlay */}
            {fill !== "empty" && (
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  fill === "half" && "w-1/2",
                )}
              >
                <Star
                  className={cn(
                    sizeStyles[size].star,
                    "text-accent-yellow fill-accent-yellow",
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
      <span
        className={cn(
          "ml-1 font-semibold font-body text-black dark:text-white",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
        )}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

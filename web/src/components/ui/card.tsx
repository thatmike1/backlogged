import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** enables hover lift effect */
  hoverable?: boolean;
}

/**
 * neubrutalist card component with optional hover effect
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    const baseStyles = [
      "bg-white",
      "border-3 border-black",
      "rounded-lg",
      "shadow-[5px_5px_0_#000]",
      "dark:bg-bg-dark-elevated dark:border-stone-200",
    ];

    const hoverableStyles = hoverable
      ? [
          "transition-all duration-150",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[7px_7px_0_#000]",
          "cursor-pointer",
        ]
      : [];

    return (
      <div
        ref={ref}
        className={cn(baseStyles, hoverableStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

/**
 * card header section
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b-3 border-black", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

/**
 * card title component
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display font-bold text-xl text-black dark:text-white",
      className,
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

/**
 * card content section
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));

CardContent.displayName = "CardContent";

/**
 * card footer section
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-t-3 border-black flex items-center gap-2",
      className,
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

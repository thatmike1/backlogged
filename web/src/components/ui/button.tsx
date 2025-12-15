import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** button style variant */
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  /** button size */
  size?: "sm" | "md" | "lg";
}

/**
 * neubrutalist button component with hover/active press effects
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles = [
      "inline-flex items-center justify-center",
      "font-semibold font-display",
      "border-3 border-black",
      "rounded-md",
      "shadow-[3px_3px_0_#000]",
      "transition-all duration-150",
      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
      "hover:shadow-[5px_5px_0_#000]",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "active:shadow-[1px_1px_0_#000]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "disabled:hover:translate-x-0 disabled:hover:translate-y-0",
      "disabled:hover:shadow-[3px_3px_0_#000]",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    ];

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary/90",
      secondary:
        "bg-white text-primary border-primary hover:bg-primary/5 dark:bg-bg-dark-elevated dark:text-white",
      success: "bg-accent-mint text-black hover:bg-accent-mint/90",
      danger: "bg-accent-coral text-black hover:bg-accent-coral/90",
      ghost:
        "bg-transparent text-black border-black hover:bg-black/5 dark:text-white dark:border-stone-200 dark:hover:bg-white/5",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

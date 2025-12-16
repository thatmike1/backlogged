import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** error message to display */
  error?: string;
}

/**
 * neubrutalist input component with error state support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    const baseStyles = [
      "w-full",
      "px-4 py-2",
      "font-body text-base",
      "bg-white",
      "border-3",
      "rounded-md",
      "shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#44403c]",
      "transition-all duration-150",
      "placeholder:text-muted",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "focus:translate-x-[-1px] focus:translate-y-[-1px]",
      "focus:shadow-[4px_4px_0_#000] dark:focus:shadow-[4px_4px_0_#44403c]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "dark:bg-bg-dark-elevated dark:text-white",
    ];

    const borderStyles = error
      ? "border-accent-coral"
      : "border-black dark:border-stone-600";

    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          className={cn(baseStyles, borderStyles, className)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-accent-coral font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

/**
 * textarea variant of neubrutalist input
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** error message to display */
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    const baseStyles = [
      "w-full",
      "px-4 py-2",
      "font-body text-base",
      "bg-white",
      "border-3",
      "rounded-md",
      "shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#44403c]",
      "transition-all duration-150",
      "placeholder:text-muted",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "focus:translate-x-[-1px] focus:translate-y-[-1px]",
      "focus:shadow-[4px_4px_0_#000] dark:focus:shadow-[4px_4px_0_#44403c]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "resize-none",
      "min-h-[100px]",
      "dark:bg-bg-dark-elevated dark:text-white",
    ];

    const borderStyles = error
      ? "border-accent-coral"
      : "border-black dark:border-stone-600";

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(baseStyles, borderStyles, className)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-accent-coral font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

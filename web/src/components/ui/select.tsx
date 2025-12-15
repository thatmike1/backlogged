import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** current selected value */
  value: string;
  /** callback when value changes */
  onChange: (value: string) => void;
  /** available options */
  options: SelectOption[];
  /** placeholder text when no value selected */
  placeholder?: string;
  /** disabled state */
  disabled?: boolean;
  /** additional class names */
  className?: string;
  /** aria label for accessibility */
  "aria-label"?: string;
}

/**
 * neubrutalist custom select/dropdown component
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  /**
   * closes dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * scrolls highlighted option into view
   */
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      highlightedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  /**
   * handles keyboard navigation
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
    }
  };

  /**
   * handles option selection
   */
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2",
          "flex items-center justify-between",
          "font-body text-base text-left",
          "bg-white dark:bg-bg-dark-elevated",
          "border-3 border-black dark:border-stone-200",
          "rounded-md",
          "shadow-[3px_3px_0_#000]",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          !disabled && "hover:translate-x-[-1px] hover:translate-y-[-1px]",
          !disabled && "hover:shadow-[4px_4px_0_#000]",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen &&
            "translate-x-[-1px] translate-y-[-1px] shadow-[4px_4px_0_#000]",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            selectedOption ? "text-black dark:text-white" : "text-muted",
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* dropdown menu */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `option-${options[highlightedIndex].value}`
              : undefined
          }
          className={cn(
            "absolute z-50 w-full mt-1",
            "bg-white dark:bg-bg-dark-elevated",
            "border-3 border-black dark:border-stone-200",
            "rounded-md",
            "shadow-[5px_5px_0_#000]",
            "max-h-60 overflow-auto",
            "animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`option-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "px-4 py-2 cursor-pointer",
                "flex items-center justify-between",
                "font-body text-base",
                "transition-colors duration-100",
                option.value === value && "font-semibold",
                highlightedIndex === index
                  ? "bg-primary/10 text-primary"
                  : "text-black dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800",
              )}
            >
              {option.label}
              {option.value === value && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

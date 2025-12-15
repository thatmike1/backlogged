import {
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ModalProps {
  /** controls modal visibility */
  open: boolean;
  /** callback when modal should close */
  onClose: () => void;
  /** optional modal title */
  title?: string;
  /** modal content */
  children: ReactNode;
  /** additional class names for the modal container */
  className?: string;
}

/**
 * neubrutalist modal component with backdrop and animations
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  /**
   * handles escape key to close modal
   */
  const handleEscape = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  /**
   * handles keyboard events on the modal
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "animate-in fade-in duration-200",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal container */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg",
          "bg-white dark:bg-bg-dark-elevated",
          "border-3 border-black dark:border-stone-200",
          "rounded-lg",
          "shadow-[8px_8px_0_#000]",
          "animate-in zoom-in-95 duration-200",
          className,
        )}
      >
        {/* header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b-3 border-black">
            <h2
              id="modal-title"
              className="font-display font-bold text-xl text-black dark:text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "p-1 rounded-md",
                "border-2 border-black",
                "shadow-[2px_2px_0_#000]",
                "transition-all duration-150",
                "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                "hover:shadow-[3px_3px_0_#000]",
                "active:translate-x-[1px] active:translate-y-[1px]",
                "active:shadow-[1px_1px_0_#000]",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* close button when no title */}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 p-1 rounded-md",
              "border-2 border-black",
              "shadow-[2px_2px_0_#000]",
              "transition-all duration-150",
              "hover:translate-x-[-1px] hover:translate-y-[-1px]",
              "hover:shadow-[3px_3px_0_#000]",
              "active:translate-x-[1px] active:translate-y-[1px]",
              "active:shadow-[1px_1px_0_#000]",
              "focus:outline-none focus:ring-2 focus:ring-primary",
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );

  // render to document.body via portal
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * merges class names using clsx and tailwind-merge
 * @param inputs - class names to merge
 * @returns merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

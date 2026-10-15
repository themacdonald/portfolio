import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fill the {n} placeholder used by localized shell labels.
 * Locale authors control word order around the placeholder.
 */
export function fillCount(template: string, count: number) {
  return template.replace(/\{n\}/g, String(count))
}

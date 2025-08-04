/**
 * Simple class name utility function 
 * Replaces the previous cn function that used clsx and tailwind-merge
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

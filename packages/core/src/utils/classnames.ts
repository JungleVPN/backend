type ClassValue = string | number | boolean | undefined | null | Record<string, unknown>;

/**
 * Combines class names, filtering out falsy values.
 * Supports strings, objects (keys with truthy values), and nested arrays.
 */
export function cn(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

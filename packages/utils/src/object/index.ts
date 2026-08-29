export function isEmptyObject<T extends object>(obj: T): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * True when `value` is a plain object (`{}` or `Object.create(null)`).
 * False for `null`, arrays, and host objects (`Error`, `Date`, `RegExp`, …).
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

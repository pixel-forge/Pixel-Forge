/**
 * Returns the last element in the array
 * @param arr
 */
export function lastArrayElement<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}
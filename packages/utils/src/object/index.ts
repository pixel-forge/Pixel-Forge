export function isEmptyObject<T extends Object>(obj: T) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
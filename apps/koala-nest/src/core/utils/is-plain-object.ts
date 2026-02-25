export function isPlainObject(val: any): boolean {
  if (typeof val !== 'object' || val === null) return false

  return Object.prototype.toString.call(val) === '[object Object]'
}

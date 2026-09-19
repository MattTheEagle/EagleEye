export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function check(value: unknown, ancestors: Set<object>): boolean {
  if (value === null) return true;
  switch (typeof value) {
    case "boolean":
    case "string":
      return true;
    case "number":
      return Number.isFinite(value);
    case "object": {
      if (ancestors.has(value)) return false; // cycle
      ancestors.add(value);
      try {
        if (Array.isArray(value)) {
          for (let index = 0; index < value.length; index++) {
            if (!check(value[index], ancestors)) return false; // holes read as undefined
          }
          return true;
        }
        if (!isPlainObject(value)) return false;
        return Object.values(value).every((item) => check(item, ancestors));
      } finally {
        ancestors.delete(value);
      }
    }
    default:
      return false; // undefined, function, symbol, bigint
  }
}

// True for values that survive JSON.stringify and JSON.parse unchanged: null, booleans, finite numbers, strings,
// arrays and plain objects made of such values. Rejects undefined (also as a property or an array hole), NaN, Infinity,
// functions, symbols, bigint, class instances (Date, Map, ...) and cycles. Never throws.
export function isJsonValue(value: unknown): value is JsonValue {
  try {
    return check(value, new Set<object>());
  } catch {
    return false; // throwing getter, stack overflow on absurd nesting, ...
  }
}

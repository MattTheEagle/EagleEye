export const EAGLE_API_VERSION = "0.4.0";

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

// Strict "x.y.z": no prefix, no pre-release or build suffix, no leading zeros.
const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function parseVersion(input: unknown): ParsedVersion | undefined {
  if (typeof input !== "string") return undefined;
  const match = VERSION_PATTERN.exec(input);
  if (!match) return undefined;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function compareVersions(a: ParsedVersion, b: ParsedVersion): -1 | 0 | 1 {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return 0;
}

// `requested` is the API version a module was written against, `provided` the one Flight Control offers.
// Compatible when the major versions match, Flight Control is at least as new and, before 1.0, the minor
// versions match as well (until 1.0 a minor bump may break the API).
export function isApiCompatible(requested: ParsedVersion, provided: ParsedVersion): boolean {
  if (requested.major !== provided.major) return false;
  if (requested.major === 0 && requested.minor !== provided.minor) return false;
  return compareVersions(provided, requested) >= 0;
}

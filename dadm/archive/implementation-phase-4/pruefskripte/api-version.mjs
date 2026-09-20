const EAGLE_API_VERSION = "0.3.0";
const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
function parseVersion(input) {
  if (typeof input !== "string") return void 0;
  const match = VERSION_PATTERN.exec(input);
  if (!match) return void 0;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}
function compareVersions(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return 0;
}
function isApiCompatible(requested, provided) {
  if (requested.major !== provided.major) return false;
  if (requested.major === 0 && requested.minor !== provided.minor) return false;
  return compareVersions(provided, requested) >= 0;
}
export {
  EAGLE_API_VERSION,
  compareVersions,
  isApiCompatible,
  parseVersion
};

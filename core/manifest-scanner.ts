export type PackageKind = "module" | "system";

export interface PackageBadge {
  // v13 uses "safe"/"unsafe"; v14 renamed "safe" to "success" and dropped "unsafe"
  // (undocumented breaking change, see breaking-changes-v13-to-v14.md).
  type: "safe" | "success" | "unsafe" | "warning" | "neutral" | "error";
  tooltip: string;
  label?: string;
  icon?: string;
}

export interface PackageLike {
  id: string;
  title: string;
  version: string;
  active?: boolean;
  availability: number;
  getVersionBadge(): PackageBadge | null;
}

export interface PackageStatus {
  id: string;
  title: string;
  version: string;
  kind: PackageKind;
  active: boolean;
  availability: number;
  badge: PackageBadge | null;
}

export interface PackageScanSource {
  modules: Iterable<PackageLike>;
  system: PackageLike;
}

function defaultSource(): PackageScanSource {
  // Safe only when called after the "ready" hook, where both are guaranteed populated.
  return { modules: game.modules!.contents, system: game.system! };
}

function toStatus(pkg: PackageLike, kind: PackageKind): PackageStatus {
  return {
    id: pkg.id,
    title: pkg.title,
    version: pkg.version,
    kind,
    active: kind === "system" ? true : Boolean(pkg.active),
    availability: pkg.availability,
    badge: pkg.getVersionBadge(),
  };
}

export function scanPackages(source: PackageScanSource = defaultSource()): PackageStatus[] {
  const results: PackageStatus[] = [];
  for (const mod of source.modules) {
    results.push(toStatus(mod, "module"));
  }
  results.push(toStatus(source.system, "system"));
  return results;
}

export function logPackageScan(source?: PackageScanSource): void {
  console.table(scanPackages(source));
}

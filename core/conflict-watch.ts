export type ConflictSource = "libWrapper.ConflictDetected" | "libWrapper.OverrideLost";

export interface ConflictEvent {
  source: ConflictSource;
  packageA: string;
  packageB: string;
  wrapperName: string;
  targets: string[];
}

export interface HooksLike {
  on(hook: string, callback: (...args: unknown[]) => void): unknown;
}

export interface ModulesLike {
  get(id: string): { active: boolean } | undefined;
}

export function isLibWrapperActive(modules: ModulesLike = game.modules as unknown as ModulesLike): boolean {
  return modules.get("lib-wrapper")?.active === true;
}

function toConflictEvent(source: ConflictSource, args: unknown[]): ConflictEvent {
  const [packageA, packageB, wrapperName, targets] = args as [string, string, string, string[]];
  return { source, packageA, packageB, wrapperName, targets };
}

export function watchForConflicts(
  onConflict: (event: ConflictEvent) => void,
  deps: { hooks?: HooksLike; modules?: ModulesLike } = {},
): void {
  const modules = deps.modules ?? (game.modules as unknown as ModulesLike);
  if (!isLibWrapperActive(modules)) {
    return;
  }

  const hooks = deps.hooks ?? (Hooks as unknown as HooksLike);
  hooks.on("libWrapper.ConflictDetected", (...args: unknown[]) => {
    onConflict(toConflictEvent("libWrapper.ConflictDetected", args));
  });
  hooks.on("libWrapper.OverrideLost", (...args: unknown[]) => {
    onConflict(toConflictEvent("libWrapper.OverrideLost", args));
  });
}

export function logConflict(event: ConflictEvent): void {
  console.warn(
    `eagleeye | ${event.source}: "${event.packageA}" vs "${event.packageB}" on "${event.wrapperName}" (targets: ${event.targets.join(", ")})`,
  );
}

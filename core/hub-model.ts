import type { RegisteredModule } from "./module-registry";

export interface HubTab {
  readonly id: string;
  readonly label: string;
}

export interface HubModel {
  readonly tabs: readonly HubTab[];
  readonly activeTabId: string | null;
  readonly empty: boolean;
}

// One tab per registered module, in registration order. The registry already lists only modules that are active
// right now, so inactive modules never get a tab.
export function buildHubModel(modules: readonly RegisteredModule[], previousActiveId?: string | null): HubModel {
  const tabs = modules.map((module) => ({ id: module.id, label: module.title || module.id }));
  const keepPrevious = previousActiveId != null && tabs.some((tab) => tab.id === previousActiveId);
  const activeTabId = keepPrevious ? previousActiveId : (tabs[0]?.id ?? null);
  return { tabs, activeTabId, empty: tabs.length === 0 };
}

export type StartFailure = "no-open-action" | "open-failed";

export type StartResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: StartFailure; readonly detail: string };

// Calls the module's open action. Never rejects; failures come back as a result.
export async function startModule(module: RegisteredModule): Promise<StartResult> {
  const open = module.open;
  if (typeof open !== "function") {
    return { ok: false, reason: "no-open-action", detail: `module "${module.id}" did not provide an open action` };
  }
  try {
    await open();
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "open-failed", detail: error instanceof Error ? error.message : String(error) };
  }
}

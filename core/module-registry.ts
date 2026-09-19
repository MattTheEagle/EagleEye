import { isApiCompatible, parseVersion, type ParsedVersion } from "./api-version";

export interface ModuleDescriptor {
  id: string;
  apiVersion: string;
  // Opens the module's UI. Called without `this`; pass an arrow or a bound function.
  open?: () => void | Promise<void>;
}

export interface ModuleInfo {
  id: string;
  title: string;
  version: string;
  active: boolean;
}

export interface ModuleInfoSource {
  get(id: string): ModuleInfo | undefined;
}

export interface RegisteredModule {
  readonly id: string;
  readonly title: string;
  readonly version: string;
  readonly apiVersion: string;
  // Only present when the descriptor provided one.
  readonly open?: () => void | Promise<void>;
}

export type RegistrationFailure =
  | "invalid-descriptor"
  | "invalid-api-version"
  | "unknown-module"
  | "inactive-module"
  | "already-registered"
  | "incompatible-api-version"
  | "internal-error";

export type RegistrationResult =
  | { readonly ok: true; readonly module: RegisteredModule }
  | { readonly ok: false; readonly reason: RegistrationFailure; readonly detail: string };

function fail(reason: RegistrationFailure, detail: string): RegistrationResult {
  return { ok: false, reason, detail };
}

export class ModuleRegistry {
  readonly apiVersion: string;
  readonly #provided: ParsedVersion;
  readonly #source: ModuleInfoSource;
  readonly #registered = new Map<string, RegisteredModule>();

  constructor(source: ModuleInfoSource, provided: string) {
    const parsed = parseVersion(provided);
    if (!parsed) throw new Error(`ModuleRegistry: "${provided}" is not a valid API version (x.y.z)`);
    this.apiVersion = provided;
    this.#provided = parsed;
    this.#source = source;
  }

  // Additional descriptor fields are ignored on purpose (forward compatibility).
  registerModule(descriptor: unknown): RegistrationResult {
    if (typeof descriptor !== "object" || descriptor === null) {
      return fail("invalid-descriptor", "descriptor must be an object");
    }
    const { id, apiVersion, open } = descriptor as Record<string, unknown>;
    if (typeof id !== "string" || id === "") {
      return fail("invalid-descriptor", "descriptor.id must be a non-empty string");
    }
    if (typeof apiVersion !== "string") {
      return fail("invalid-descriptor", "descriptor.apiVersion must be a string");
    }
    if (open !== undefined && typeof open !== "function") {
      return fail("invalid-descriptor", "descriptor.open must be a function when given");
    }

    const requested = parseVersion(apiVersion);
    if (!requested) {
      return fail("invalid-api-version", `apiVersion "${apiVersion}" is not of the form x.y.z`);
    }

    const info = this.#source.get(id);
    if (!info) return fail("unknown-module", `no module with id "${id}" is installed`);
    if (!info.active) return fail("inactive-module", `module "${id}" is not active`);
    if (this.#registered.has(id)) return fail("already-registered", `module "${id}" is already registered`);
    if (!isApiCompatible(requested, this.#provided)) {
      return fail(
        "incompatible-api-version",
        `module "${id}" requests API ${apiVersion}, Flight Control provides ${this.apiVersion}`,
      );
    }

    const module: RegisteredModule = Object.freeze({
      id,
      title: info.title,
      version: info.version,
      apiVersion,
      ...(typeof open === "function" ? { open: open as () => void | Promise<void> } : {}),
    });
    this.#registered.set(id, module);
    return { ok: true, module };
  }

  // Registered AND active right now, in registration order. Returns a fresh array.
  list(): RegisteredModule[] {
    return [...this.#registered.values()].filter((entry) => this.#source.get(entry.id)?.active === true);
  }
}

export function defaultModuleInfoSource(): ModuleInfoSource {
  return {
    get(id) {
      const pkg = game.modules!.get(id);
      if (!pkg) return undefined;
      return { id: pkg.id, title: pkg.title, version: pkg.version, active: pkg.active === true };
    },
  };
}

import { parseVersion } from "./api-version";

// The game system guard: which system runs, and whether Flight Control has been tested with its version. It reports and
// blocks nothing. What cannot be read is "unknown", never an error and never a silent "tested".

export const SUPPORTED_SYSTEM_ID = "dnd5e";

// The versions of the game system Flight Control has been tested with. A version joins this list with a release, after
// the project lead has checked it in a running Foundry. Frozen, so no module can add to it through the API.
export const TESTED_SYSTEM_VERSIONS: readonly string[] = Object.freeze(["5.3.3"]);

export type SystemStatus =
  // the version is in the list
  | "tested"
  // not in the list, but major and minor version are those of a listed version
  | "same-line"
  // dnd5e, a readable version, on no tested line
  | "untested"
  // a readable system id that is not dnd5e
  | "other-system"
  // the id or the version cannot be read, or the version is not a strict x.y.z
  | "unknown";

export interface SystemInfo {
  // null when it cannot be read
  readonly id: string | null;
  // null when it cannot be read, is not a strict x.y.z, or does not matter (another system)
  readonly version: string | null;
  readonly status: SystemStatus;
  readonly testedVersions: readonly string[];
}

// What Foundry says about the system, as it comes; either call may throw.
export interface SystemSource {
  id(): unknown;
  version(): unknown;
}

// Never throws. The steps, in this order:
//  1. an id that is not a non-empty text is unknown;
//  2. an id other than the supported one is another system, whatever its version;
//  3. a version that is not a strict x.y.z text is unknown;
//  4. a listed version is tested; 5. one on the line (major and minor) of a listed version is on the same line; 6. the rest is untested.
export function evaluateSystem(
  source: SystemSource,
  tested: readonly string[] = TESTED_SYSTEM_VERSIONS,
  supportedId: string = SUPPORTED_SYSTEM_ID,
): SystemInfo {
  const result = (id: string | null, version: string | null, status: SystemStatus): SystemInfo =>
    Object.freeze({ id, version, status, testedVersions: Object.freeze([...tested]) });

  try {
    const id = source.id();
    if (typeof id !== "string" || id === "") return result(null, null, "unknown");
    if (id !== supportedId) return result(id, null, "other-system");

    const version = source.version();
    const parsed = parseVersion(version);
    if (typeof version !== "string" || parsed === undefined) return result(id, null, "unknown");
    if (tested.includes(version)) return result(id, version, "tested");

    const sameLine = tested.some((listed) => {
      const other = parseVersion(listed);
      return other !== undefined && other.major === parsed.major && other.minor === parsed.minor;
    });
    return result(id, version, sameLine ? "same-line" : "untested");
  } catch {
    return result(null, null, "unknown");
  }
}

// A text to show, as a localization key with its data.
export interface SystemNotice {
  readonly key: string;
  readonly data: Record<string, string>;
}

// What the Gamemaster is told: only for a system that is not known to be fine.
export function noticeFor(info: SystemInfo): SystemNotice | undefined {
  switch (info.status) {
    case "untested":
      return { key: "EAGLEFLIGHTCONTROL.system.untested", data: { version: info.version ?? "", tested: info.testedVersions.join(", ") } };
    case "other-system":
      return { key: "EAGLEFLIGHTCONTROL.system.otherSystem", data: { id: info.id ?? "" } };
    case "unknown":
      return { key: "EAGLEFLIGHTCONTROL.system.unknown", data: {} };
    default:
      return undefined;
  }
}

export interface AnnounceEnvironment {
  // The user of this client has a Gamemaster role (Gamemaster or Assistant).
  isGm(): boolean;
  log: { info(message: string): void; warn(message: string): void };
  notify(level: "warn", message: string): void;
  text(key: string, data?: Record<string, string>): string;
}

// What the log shows for a system that could not be read: the raw values, so the reason can be seen.
function describeRaw(source: SystemSource): string {
  const read = (get: () => unknown): string => {
    try {
      return JSON.stringify(get()) ?? "undefined";
    } catch {
      return "unreadable";
    }
  };
  return `id ${read(() => source.id())}, version ${read(() => source.version())}`;
}

// Says what the guard found: one log line every time, and one notice when the user is a Gamemaster or Assistant and the
// system is not known to be fine. Nothing is blocked. Never throws; whatever the source, the log or the notification does
// is swallowed. Meant to be called once per session.
export function announceSystem(source: SystemSource, environment: AnnounceEnvironment): SystemInfo {
  const info = evaluateSystem(source);

  try {
    const known = info.status === "tested" || info.status === "same-line" || info.status === "untested";
    const subject = known ? `${info.id} ${info.version}` : info.id ?? "unreadable";
    const detail = info.status === "unknown" ? `; ${describeRaw(source)}` : "";
    const line = `eagle-flight-control | game system: ${subject} (${info.status})${detail}`;
    if (info.status === "tested" || info.status === "same-line") environment.log.info(line);
    else environment.log.warn(line);
  } catch {
    // a failing log must not stop the notice
  }

  try {
    const notice = noticeFor(info);
    if (notice && environment.isGm()) environment.notify("warn", environment.text(notice.key, notice.data));
  } catch {
    // a failing notification must not break the caller
  }
  return info;
}

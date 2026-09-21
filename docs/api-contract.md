# Eagle Flight Control — API contract

**API version:** `0.8.0`
**Status:** development. Before `1.0.0` a minor version may break the API (see section 5).
**Audience:** authors of Eagle modules. Flight Control does not integrate third-party modules. Registration by a
third-party module is not a supported use; it cannot be prevented technically, and such a module would simply
count as registered.

## What the API offers

Flight Control is the interface between the Eagle modules, the D&D 5e system and Foundry. A module reaches it through
its API object (section 1), which has five members:

| Member | What it does | Since API |
|---|---|---|
| `version` | The API version of Flight Control (section 5). | `0.1.0` |
| `registerModule` | Registers your module, so that it gets a tab in the hub, optionally with an Open button (sections 2 and 3). | `0.1.0`; `open` since `0.2.0` |
| `request` | Asks Flight Control to do something. A request that needs the Gamemaster's rights runs on the Gamemaster's client, after the asking user has been confirmed, and the rights per module and user are checked before any request runs; a request type that changes the world is for a Gamemaster or Assistant only (section 4). | `0.3.0`; forwarding `0.4.0`; confirmation `0.5.0`; rights `0.6.0`; first type that changes data `0.8.0` |
| `getRights` | Tells your module what the user of this client may do with it (section 4). | `0.6.0` |
| `getSystemInfo` | Tells your module which game system runs and whether Flight Control was tested with its version (section 4). | `0.7.0` |

The hub (section 3) is a window in Foundry and not a member of the API: one tab per registered module with its
settings and, for the Gamemaster, the rights per module and user.

## Contents

1. [Getting the API](#1-getting-the-api)
2. [Registering a module](#2-registering-a-module)
3. [The hub](#3-the-hub)
4. [Requests](#4-requests): the request and its results, failure reasons, where a request runs, forwarded requests, who asked, rights per module and user, request types, the game system
5. [API version and compatibility](#5-api-version-and-compatibility)
6. [Manifest requirements for Eagle modules](#6-manifest-requirements-for-eagle-modules)
7. [Behaviour when Flight Control is missing or deactivated](#7-behaviour-when-flight-control-is-missing-or-deactivated)
8. [What is verified](#8-what-is-verified)
9. [Not part of this version](#9-not-part-of-this-version)
10. [Change history](#10-change-history)

## 1. Getting the API

Flight Control attaches its API to its own module object while it initializes:

```js
const api = game.modules.get("eagleeye")?.api;
```

- Read it from your **`setup` hook or later**. Before `setup` it may not exist yet, because the load order of
  modules is not documented.
- Always handle `undefined`: Flight Control can be missing or deactivated.
- The API object is frozen. It has exactly five members: `version`, `registerModule`, `request`, `getRights` and
  `getSystemInfo`.

TypeScript (optional): declare the shape in your own repository. Flight Control itself types the parameters as
`unknown`; pass the shapes below.

```ts
type RegistrationFailure =
  | "invalid-descriptor"
  | "invalid-api-version"
  | "unknown-module"
  | "inactive-module"
  | "already-registered"
  | "incompatible-api-version"
  | "internal-error";

type RegistrationResult =
  | {
      readonly ok: true;
      readonly module: {
        readonly id: string;
        readonly title: string;
        readonly version: string;
        readonly apiVersion: string;
      };
    }
  | { readonly ok: false; readonly reason: RegistrationFailure; readonly detail: string };

type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };

type RequestFailure =
  | "invalid-request"
  | "not-registered"
  | "unknown-request"
  | "unsupported-version"
  | "invalid-payload"
  | "handler-failed"
  | "internal-error"
  | "no-gm"
  | "relay-timeout"
  | "relay-failed"
  | "not-permitted";

type RequestResult =
  | { readonly ok: true; readonly value: JsonValue }
  | { readonly ok: false; readonly reason: RequestFailure; readonly detail: string };

type RightsLevel = "denied" | "own" | "all";

type RightsResult =
  | { readonly ok: true; readonly value: { readonly level: RightsLevel } }
  | {
      readonly ok: false;
      readonly reason: "invalid-request" | "not-registered" | "internal-error";
      readonly detail: string;
    };

type SystemStatus = "tested" | "same-line" | "untested" | "other-system" | "unknown";

type SystemInfoResult =
  | {
      readonly ok: true;
      readonly value: {
        readonly id: string | null;
        readonly version: string | null;
        readonly status: SystemStatus;
        readonly testedVersions: readonly string[];
      };
    }
  | { readonly ok: false; readonly reason: "internal-error"; readonly detail: string };

interface EagleFlightControlApi {
  readonly version: string;
  registerModule(descriptor: {
    id: string;
    apiVersion: string;
    open?: () => void | Promise<void>;
  }): RegistrationResult;
  request(request: {
    module: string;
    type: string;
    version?: number;
    payload?: JsonValue;
  }): Promise<RequestResult>;
  getRights(moduleId: string): RightsResult;
  getSystemInfo(): SystemInfoResult;
}

declare global {
  interface ModuleConfig {
    eagleeye: { api: EagleFlightControlApi };
  }
}
```

## 2. Registering a module

Register once, in your `setup` hook:

```js
Hooks.once("setup", () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) return; // Flight Control is missing or not active: switch off your features that need it

  const result = api.registerModule({
    id: "my-eagle-module",
    apiVersion: "0.8.0",
    open: () => new MyModuleApp().render({ force: true }), // optional
  });
  if (!result.ok) {
    // result.reason is one of the codes below; switch off your features that need Flight Control
  }
});
```

**Descriptor**

| Field | Type | Meaning |
|---|---|---|
| `id` | string, not empty | The id of your module. It must be installed and active. |
| `apiVersion` | string `x.y.z` | The API version your module was written against. |
| `open` | function, optional | Opens the UI of your module. The hub calls it without arguments and without `this` (pass an arrow or a bound function); it may return a promise. |

Additional fields are ignored; they are reserved for later versions of the contract. Title and version of your
module are read from Foundry's manifest, not from the descriptor.

**Result:** `{ ok: true, module: { id, title, version, apiVersion } }` or `{ ok: false, reason, detail }`.
`registerModule` never throws. `detail` is a human-readable sentence for logs, not for parsing.

**Failure reasons** (stable codes, part of the contract)

| `reason` | Meaning | Suggested reaction |
|---|---|---|
| `invalid-descriptor` | The argument is not an object, `id` / `apiVersion` is missing or not a string, or `open` is given but is not a function. | Fix the call. |
| `invalid-api-version` | `apiVersion` is not strict `x.y.z` (no prefix, no suffix, no leading zeros). | Fix the value. |
| `unknown-module` | No installed module has this `id`. | Fix the id. |
| `inactive-module` | The module is installed but not active. | Only register from your own active module. |
| `already-registered` | This `id` is already registered. The first registration is kept. | Register only once. |
| `incompatible-api-version` | See section 5. | Switch off the features of your module that need Flight Control and tell the user. |
| `internal-error` | Unexpected error inside Flight Control. | Report it. |

Flight Control knows a module only if its registration succeeded **and** the module is active. A module that
never registers is unknown to Flight Control; Flight Control does not scan other modules.

## 3. The hub

The hub is a window with one tab per registered module that is active. It opens from a button in Foundry's module
settings ("Open Eagle Flight Control") and is visible to the Gamemaster only.

For your module the hub shows a tab titled with the `title` of your module manifest. The tab contains:

1. **A header** with the version of your module and the API version you registered with.
2. **An Open button**, only if you passed `open` when registering. Clicking it calls your `open` function. If it
   throws or rejects, the hub shows an error notification; nothing else happens.
3. **Your settings:** every setting registered in the namespace of your module (your module id) with
   `config: true`, the same rule Foundry uses for its own settings window.

| Registered type | Shown as |
|---|---|
| `Boolean` | checkbox |
| `String` | text field; a select list if the setting has `choices` |
| `Number` | number field; `range` gives minimum, maximum and step. With a minimum and a maximum the field is a slider with a number field, as in Foundry's settings window |

The type may be registered as the constructor (`Boolean`, `String`, `Number`) or as a `BooleanField`,
`StringField` or `NumberField`. Settings of any other type are listed by name with the note "Cannot be edited
here" and no value. Settings with `requiresReload: true` carry the note "Takes effect after a reload"; the hub does
not open Foundry's own reload prompt.

If your module has no such settings, the tab says so.

The tab has no heading of its own; the highlighted tab names the module. For the Gamemaster the tab ends with **who may
use your module**: one select list per player with a level (see "Rights per module and user" in section 4). An
Assistant does not see it.

Changes made in the hub are validated (choices, number bounds) and saved with `game.settings.set`. An invalid
value is refused: the field shows the stored value again and a notification says why. Only the Gamemaster can save
changes.

A module that has not registered, is not active, or was rejected (for example with `incompatible-api-version`) has
no tab. With no registered modules the hub says so.

## 4. Requests

Once your module is registered, it can ask Flight Control to do things. All changes to Foundry data go through
Flight Control, while your module keeps its own UI and logic. In this version Flight Control offers three request
types as proofs that the channels and the rights work and one that changes Foundry data (`compendium.create`, see "Compendia"
below); further request types come with the modules that need them.

```js
const result = await api.request({
  module: "my-eagle-module",
  type: "flightcontrol.ping",
  payload: { echo: "hello" },
});
if (result.ok) {
  console.log(result.value); // { apiVersion: "0.8.0", module: "my-eagle-module", echo: "hello" }
} else {
  console.warn(result.reason, result.detail);
}
```

**Request:** one object.

| Field | Type | Meaning |
|---|---|---|
| `module` | string, not empty | The id of your module, the sender. It must be registered and active. |
| `type` | string | The request type: `<area>.<verb>`, lower case letters and digits, dot separated, for example `flightcontrol.ping`. |
| `version` | positive integer, optional | The version of the request type you use. Default `1`. |
| `payload` | JSON value, optional | The data of the request. What it must look like depends on the request type. |

Additional fields are ignored.

**Result:** `{ ok: true, value }` or `{ ok: false, reason, detail }`. `request` returns a promise and never rejects.
`value` is a JSON value; `detail` is a human-readable sentence for logs, not for parsing.

**JSON only:** requests and results contain only JSON values: `null`, booleans, finite numbers, strings, arrays and
plain objects of these. No `undefined`, functions, class instances (such as `Date` or `Map`) or DOM elements. This
is what lets Flight Control send a request to the Gamemaster's client (see "Where a request runs").

**Failure reasons of requests** (stable codes, part of the contract)

| `reason` | Meaning | Suggested reaction |
|---|---|---|
| `invalid-request` | The request is not an object, or `module`, `type`, `version` or `payload` is missing or has the wrong shape (a payload that is not JSON counts as wrong). | Fix the call. |
| `not-registered` | Your module is not registered with Flight Control, or it is not active. | Register in `setup` first (section 2). |
| `unknown-request` | Flight Control offers no request type with this name. | Fix the type, or check your Flight Control version. |
| `unsupported-version` | The request type does not support this version; `detail` names the supported ones. | Use a supported version. |
| `invalid-payload` | The payload does not fit the request type; `detail` says why. | Fix the payload. |
| `handler-failed` | The request was understood but carrying it out failed: an error in Foundry, missing rights, or a result that is not JSON. | Show the message; retry only if that makes sense. |
| `internal-error` | Unexpected error inside Flight Control. | Report it. |
| `no-gm` | The request has to run on the Gamemaster's client and no Gamemaster is connected. Nothing was sent. | Tell the user that a Gamemaster has to be online; try again later. |
| `relay-timeout` | The Gamemaster's client did not answer within 15 seconds. **The outcome is unknown: the request may still run.** | Do not assume it failed; ask again only if the request type tolerates being run twice. |
| `relay-failed` | The request could not be delivered or answered (Foundry refused the transfer, or the answer was not a result); `detail` says what happened. | Show the message; retry only if that makes sense. |
| `not-permitted` | The request was refused: the receiving side is not a Gamemaster's client, the request type is not run for other clients, the asking user could not be confirmed (see "Who asked"), the request type is for a Gamemaster or Assistant only and the user has neither role, or the rights per module and user do not allow it (see "Rights per module and user"). `detail` says which. | Do not retry. Ask `getRights` before you offer the action. |

Treat every reason you do not know as a failure: later versions of this contract may add reasons.

**Versions:** a request without `version` always means version `1`. A version of a request type stays supported as
long as its contract lists it, so a module keeps working when Flight Control adds a newer version. A new version of a
request type does not change the API version of this contract. **A new request type does, until `1.0.0`:** it raises
the minor version of the API (section 5), so that a module written for a request type is refused at registration by a
Flight Control that lacks it, instead of failing when it asks.

**Where a request runs:** every request type says where it runs (last table of this section). Most types run in
your own client, with the rights of the current user. A type that needs the Gamemaster's rights runs on the
Gamemaster's client: a user without a Gamemaster role (a player, a trusted player) does not need any Foundry
permission for it, because Flight Control sends the request to the connected Gamemaster and returns the answer. A user
with a Gamemaster role (Gamemaster or Assistant) runs every type in their own client.

**Forwarded requests** (since API `0.4.0`)

- Flight Control sends only the four fields of the request (`module`, `type`, `version`, `payload`), together with the
  id of the asking user and an identifier (see "Who asked"). The Gamemaster's client checks everything again and does
  not trust what the sender says about itself, so the failure reasons above are the same as for a request that runs
  locally.
- A forwarded request may be at most 65,536 characters of JSON text; larger requests fail with `invalid-request`.
  The caller waits at most 15 seconds (`relay-timeout`). Keep requests and results small.
- Whoever the sender is, only request types that are marked as running on the Gamemaster's client are ever run there.
  A client that is not a Gamemaster's client refuses relayed requests with `not-permitted`.
- If a request that ran on the Gamemaster's client fails with `handler-failed` or `internal-error`, `detail` is a
  general sentence; the details are in the Gamemaster's console. Other reasons keep their `detail`.
- Request types that run on the Gamemaster's client are added by Flight Control itself. The rights per module and user
  decide whether a module may use them for a user (see "Rights per module and user"), and a type that acts on documents
  names them.
- **There is no limit** on how many requests a client may send or have waiting at once. An altered client can burden the
  Gamemaster's client, and the client of a user it names, with requests and questions. That discloses nothing and lets
  nothing run that the checks refuse, but it can slow those clients down. Send requests only as often as your module
  needs.

**Who asked** (since API `0.5.0`)

Foundry does not tell the Gamemaster's client which user sent a query. Flight Control therefore asks the user itself:

1. The client of the asking user remembers each forwarded request under a random identifier that only it knows, and
   sends that identifier and the id of the user along with the request.
2. Before the Gamemaster's client runs anything, it asks the client of the named user whether that client sent the
   request with this identifier. It waits at most 5 seconds.
3. Only the answer "yes" from the named user's client lets the request run. A "no", a wrong or missing answer, a user
   who is not connected, and no answer in time all refuse the request with `not-permitted` ("the asking user could
   not be confirmed"). A request never runs without the confirmation.
4. A request type that runs on the Gamemaster's client gets the confirmed user (`flightcontrol.gmping` reports it as
   `askedBy`). A request that runs in your own client runs for the current user of that client.

This stops a client from posing as another user. It does not stop a user from posing as themselves.

**Rights per module and user** (since API `0.6.0`)

The Gamemaster decides in the hub which module a player may use. For every module and every user there is one of
three levels:

| Level | Meaning |
|---|---|
| `denied` | Requests of this module are refused for this user. |
| `own` | Requests are run. A request that acts on documents is run only when the user owns all of them. |
| `all` | Requests are run, whether the documents belong to the user or not. |

- **Defaults:** a Gamemaster and an Assistant may always use every module; nothing is set for them. Every other user has
  the level `denied` for a module until the Gamemaster sets another level in the tab of that module. A new module and a
  new user start with `denied`.
- **Who sets them:** only the Gamemaster (not an Assistant), in the hub, one select list per player in the tab of the
  module. Flight Control stores them in a world setting of its own (`eagleeye.rights`); do not write it yourself.
- **Where they are checked:** in Flight Control's request kernel, after the payload was checked and before the request
  type runs. On the Gamemaster's client the check is binding: it uses the user who confirmed the request (see "Who
  asked"). For a request type that runs in the caller's own client it is a rule that follows the same table; an altered
  client can skip it, but the request then runs with that user's own Foundry rights only, so nothing is gained that
  Foundry does not allow anyway.
- **Targets:** a request type says which documents it acts on, as UUIDs. "Own" means that Foundry gives the asking user
  the ownership level Owner over the document; Foundry lets a document inside another (an item of an actor) follow the
  ownership of its parent. A target that cannot be found counts as not owned, and the refusal is the same for a document
  that belongs to someone else and for one that cannot be found. A request without a target is not restricted by `own`.
- **Requests for a Gamemaster or Assistant only:** a request type can be marked so. It is refused for every user who has
  neither the Gamemaster nor the Assistant role, **whatever level the module has for that user**: a player with the level
  `own` or `all` gets `not-permitted` too. The check is the rights check, so it is binding where the request runs (on the
  Gamemaster's client, for the user who confirmed the request). A Gamemaster and an Assistant are not restricted by it.
  Every request type that changes the world is marked so.
- **Refusals** come as `not-permitted`; `detail` says which rule: `module "<id>" may not be used by this user`,
  `module "<id>" may act only on targets this user owns`, `this request may only be made by a Gamemaster or Assistant`,
  `the user of this request is not known`, `the rights could
  not be read, so nothing is allowed until they can` (the stored rights are damaged: nobody but a Gamemaster or
  Assistant may do anything until the Gamemaster sets a level in the hub), `the rights could not be set up, so nothing
  is allowed` (Flight Control could not set up its rights when Foundry started: every request is refused, even for a
  Gamemaster, and `getRights` answers `denied`), or `the rights could not be checked`.
  A failed check never lets a request run.
- **`getRights(moduleId)`** tells your module what the user of this client may do with a module, so it can show or hide
  its own controls:

```js
const result = api.getRights("my-eagle-module");
if (result.ok) console.log(result.value.level); // "denied", "own" or "all"
```

  It answers for a registered, active module: `all` for a Gamemaster or Assistant, otherwise what the Gamemaster set
  (`denied` when nothing is set). It reads the rights this client knows and never throws. The check at the request is
  what counts, not this answer. Call it from `ready` or later. Failures: `invalid-request` (not a non-empty string),
  `not-registered` (the module is not registered or not active), `internal-error`.
- **Rules for request types:** a type that acts on documents names them, otherwise `own` cannot restrict it. A type that
  belongs to one module has to state which modules may use it, because the rights are per module and `module` is only what
  the caller states; **no type of Flight Control belongs to a module**: they are Foundry operations that belong to Flight
  Control, and every registered module the Gamemaster has given a level may ask for them. A type that runs on the
  Gamemaster's client and changes data or hands out knowledge only the Gamemaster has says how in the design of its
  milestone; every type that changes the world is `gmOnly` (see above). The proofs below do none of this; `compendium.create`
  is described under "Compendia".
- **What a type is:** one Foundry operation (create a compendium, later import or update documents), not one step of a
  module's feature. What a module wants (which compendium, which name, which version, which links to rewrite) is decided in
  the module; Flight Control only carries out the operation. A request names documents by UUID and never carries a
  document as data: a forwarded request may be at most 65,536 characters, and documents such as large NPCs and journals
  are bigger. A type that creates something answers "it exists already" when asked again, because after `relay-timeout` the
  outcome is unknown (see "Failure reasons of requests").

**The sender is trusted:** `module` is the id your module states; Foundry cannot prove which code made the call.
Treat it as an honest label, not as security: an altered client can state the id of another module, so the rights per
module hold against modules that follow the rules, and an altered client is limited to the modules its user may use.
The user is a different matter for a forwarded request (see "Who asked").

**Request types in this version**

| Type | Version | Runs on | Payload | Result |
|---|---|---|---|---|
| `flightcontrol.ping` | `1` | your own client | none, `null`, or `{ echo?: string }` (`echo` up to 200 characters) | `{ apiVersion, module, echo }`; `echo` is `null` when not given |
| `flightcontrol.gmping` | `1` | the Gamemaster's client | the same as `flightcontrol.ping` | `{ apiVersion, module, echo, ranBy: { userId, isGm }, askedBy }`; `ranBy` names the user whose client ran the request, `askedBy` the user who confirmed it (`null` when not known) |
| `flightcontrol.targetping` | `1` | the Gamemaster's client | `{ uuid: string }`, the UUID of a document (up to 200 characters) | `{ apiVersion, module, uuid, askedBy }`; the document is the request's target, the type does nothing with it and tells nothing about it |
| `compendium.create` | `1` | the Gamemaster's client | `{ type, label, name }` (see "Compendia") | `{ created, collection, name, label, type, locked, ownership }`; for a Gamemaster or Assistant only |

Use `flightcontrol.ping` to check that the channel works, and `flightcontrol.gmping` to check that a request reaches
the Gamemaster's client: for a player it answers with the Gamemaster's `userId` in `ranBy` and the player's own id in
`askedBy`, or with `no-gm` if no Gamemaster is connected. Use `flightcontrol.targetping` to see the rights for own and
foreign targets: with the level `own` it answers for a document the user owns and refuses every other with
`not-permitted`; with `all` it answers for both.

**Compendia** (since API `0.8.0`)

`compendium.create` (version `1`) creates a world compendium. It runs on the Gamemaster's client, is for a Gamemaster or
Assistant only (see "Requests for a Gamemaster or Assistant only") and names no target: it acts on no existing document.

```js
const result = await api.request({
  module: "my-eagle-module",
  type: "compendium.create",
  payload: { type: "Item", label: "Eagle Spells (2014)", name: "eagle-spells-2014" },
});
// { ok: true, value: { created: true, collection: "world.eagle-spells-2014", name: "eagle-spells-2014",
//   label: "Eagle Spells (2014)", type: "Item", locked: false, ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" } } }
```

| Field | Meaning |
|---|---|
| `type` | The document type of the compendium: `Actor`, `Adventure`, `Cards`, `Item`, `JournalEntry`, `Macro`, `Playlist`, `RollTable` or `Scene`. |
| `label` | The title of the compendium; not empty after white space at both ends is removed, at most 200 characters. |
| `name` | The name of the compendium without the package: lower case letters and digits, joined by single hyphens or underscores (`^[a-z0-9]+([-_][a-z0-9]+)*$`), at most 100 characters. This is a safe part of what Foundry accepts (no spaces, no periods, no special characters); Flight Control does not make a name from the label. |

- **What it does:** it looks for a world compendium of that name. If there is none, it creates one with `createCompendium`
  and answers `created: true`. It changes nothing else about the new compendium: no lock and no ownership. `locked` and
  `ownership` in the answer are what Foundry gave it (`ownership` maps a role to a level).
- **Asking again is safe:** a compendium of that name and document type that exists already is left alone and answered
  with `created: false`, described as it is (its own label, lock and ownership). This lets a module continue after
  `relay-timeout`, where the outcome is unknown.
- **Failures:** `invalid-payload` (the detail names the field), `not-permitted` (the user is neither Gamemaster nor
  Assistant, or the module is denied), `handler-failed`: Foundry refused (its message is in `detail` for a Gamemaster or
  Assistant, whose client runs the request), or a compendium of that name exists with another document type (nothing is
  touched). Nothing is deleted, renamed or filled.
- **Not verified in a running Foundry:** see section 8.

**The game system** (since API `0.7.0`)

Flight Control is made for the D&D 5e system (`dnd5e`) and knows the versions of it that it was tested with. It tells the
Gamemaster when the system is not one of those, and it tells your module, so the module can adapt. It only reports:
requests and the hub work in every case, and nothing is blocked because of the status.

The status of the system is one of five values. Flight Control looks at the id of the system first, then at its version:

| `status` | Meaning |
|---|---|
| `unknown` | The id of the system or its version cannot be read, or the version is not a strict `x.y.z` (no prefix, no suffix such as `-rc.1`, no leading zeros). |
| `other-system` | The id is readable and is not `dnd5e`. The version does not matter. |
| `tested` | The version is in the list of tested versions. |
| `same-line` | The version is not in the list, but its major and minor version are those of a listed version (5.3.4 when 5.3.3 is listed). |
| `untested` | Any other version of `dnd5e`. |

- **The list of tested versions** is part of Flight Control. It grows with a release, after the project lead has checked
  the version in a running Foundry. Today it holds `5.3.3`.
- **The notice:** when the world is ready, Flight Control writes one line to the console
  (`eagleeye | game system: dnd5e 5.3.3 (tested)`; a warning for `untested`, `other-system` and `unknown`). A user with a
  Gamemaster role (Gamemaster or Assistant) also gets one notification for `untested`, `other-system` and `unknown`. A
  player gets none, and nobody gets one for `tested` or `same-line`.
- **`getSystemInfo()`** tells your module the same:

```js
const result = api.getSystemInfo();
if (result.ok) console.log(result.value.status, result.value.id, result.value.version);
// "tested" "dnd5e" "5.3.3"
```

  `value` is `{ id, version, status, testedVersions }`. `id` and `version` are `null` when they cannot be read
  (`version` is also `null` for another system); `testedVersions` is a frozen copy of the list. The answer is worked out
  anew at every call, for the system of this client. It needs no rights and never throws; the only failure is
  `internal-error`. Call it from `ready` or later.
- **Rules for request types** (for the versions of this contract that add them): a request type that depends on the D&D
  data model states in the design of its milestone which statuses it accepts and what it does for the others.

## 5. API version and compatibility

`requested` is the `apiVersion` in your descriptor, `provided` is `api.version`. The registration is accepted
if all of these hold:

1. the major versions are equal,
2. if the major version is `0`, the minor versions are equal as well,
3. `provided` is at least as new as `requested`.

| requested | provided | Result |
|---|---|---|
| `0.1.0` | `0.1.0` | accepted |
| `0.1.0` | `0.1.5` | accepted |
| `0.1.5` | `0.1.0` | rejected (Flight Control is older) |
| `0.1.0` | `0.2.0` | rejected (before 1.0 a minor bump may break) |
| `1.0.0` | `1.4.2` | accepted |
| `1.2.0` | `1.1.9` | rejected (Flight Control is older) |
| `1.0.0` | `2.0.0` | rejected (different major) |

The API version is independent of the module version in `module.json`: the module version says which release of
Flight Control you have, the API version says which contract it offers.

**Before and after `1.0.0`:** the API stays below `1.0.0` until the first module outside Flight Control (the planned
Eagle Library) has used it without a break. Until then a change of the minor version may break the API (rule 2 above), and
every new request type raises the minor version (section 4, "Versions"). From `1.0.0` on, a minor version only adds to
the API and only a new major version may break it.

## 6. Manifest requirements for Eagle modules

Declare Flight Control as a required module:

```json
"relationships": {
  "requires": [
    { "id": "eagleeye", "type": "module", "compatibility": { "minimum": "<Flight Control module version>" } }
  ]
}
```

- According to Foundry's module documentation, a module whose required modules are not installed cannot be
  enabled (not re-checked for this version).
- Whether Foundry enforces the `compatibility` range when a module is enabled is **not verified**. The API
  version check at registration (section 5) is the check you can rely on.
- **Module version and API version:** the two numbers are independent (section 5). The module version `0.1.0` is the
  first that contains an API; the earlier module version `0.0.1` predates it. Use the module version that first
  provides the API version you need as `minimum`:

  | Module version | API version |
  |---|---|
  | `0.1.0` | `0.7.0` |
  | `0.2.0` | `0.8.0` |

  The table gets a row for every module version that changes the API version.
- **Texts and files:** Flight Control ships `lang/en.json` and lists it under `languages` in its manifest. A package
  that leaves `lang/` out shows raw text keys in the hub.

## 7. Behaviour when Flight Control is missing or deactivated

- **Not installed:** according to Foundry's documentation your module cannot be enabled (see section 6).
- **Installed but deactivated:** Foundry's module management window does not let a user deactivate a module while an
  active module requires it: it shows the notification "This module can not be disabled as it is required by the
  following: …" (seen with three test modules that require Flight Control). Other ways to end up with Flight Control
  deactivated, for example a module that does not declare it as required, are **not verified**. Your code has to handle
  `api === undefined` in any case.

## 8. What is verified

The version rules, the registry, the shape of the API object, the logic behind the hub (tabs, settings, saving, open
action), the request kernel (envelope checks, sender check, handlers, versions, JSON rule, results), the relay
(where a request runs, forwarding, the Gamemaster's side, limits, failure reasons) and the rights (levels, the check,
what the hub's rights block shows and writes, `getRights`) and the game system guard (the five states, the notice,
`getSystemInfo`) and the request type `compendium.create` (the payload, creating, asking again, the refusal of everybody who
is neither Gamemaster nor Assistant, also with the levels `own` and `all`, and the same refusal through the relay) are covered by unit
tests of the pure logic.

**Verified in a running Foundry** (Foundry v13, build 351, on Forge, a dnd5e world; four test modules; live checks on
2026-09-19 with API `0.3.0` and on 2026-09-20 with API `0.4.0`, `0.5.0`, `0.6.0` and `0.7.0`, the last one with the
release build, module version `0.1.0`):

- Flight Control attaches the API to its module object during `init`, and other modules can read it from their
  `setup` hook. Registration runs inside Foundry's `setup` phase.
- A registration with a compatible API version is accepted (`ok: true`); one with an incompatible version is
  rejected with `incompatible-api-version`. Both results have the shapes documented above.
- The hub opens from the settings menu and shows one tab per registered active module. A module that never
  registers, and a rejected module, have no tab. Switching tabs works. Each tab shows the header, the Open button
  (only with `open`) and the settings; the Open button calls your `open` function. A changed checkbox, select list or
  number field reaches the `onChange` of the setting exactly once per change. A number with a `range` that has a
  minimum and a maximum is a slider with a number field. Values changed in the hub are still there after the hub is closed and opened again and after a reload.
- Requests: `flightcontrol.ping` from a registered module returns `ok: true`. The same request from a module that
  is not registered returns `not-registered`; an unknown request type returns `unknown-request`; a payload with
  `echo: 5` returns `invalid-payload` (detail "payload.echo must be a string"). Flight Control logs a warning for each
  failure and nothing for a success. The value of a successful `flightcontrol.ping` has `apiVersion`, `module` and
  `echo` (seen as `ok, api 0.4.0, module eagleeye-dummy-a, echo hello`).
- The relay (API `0.4.0`): a request for a type that runs on the Gamemaster's client (`flightcontrol.gmping`) from a player
  is forwarded to the connected Gamemaster, and the result comes back with `ranBy` naming the Gamemaster's user, not the
  player's. Without a connected Gamemaster the request returns `no-gm`. A Gamemaster who asks runs it in their own
  client. The results (with a nested object) arrive unchanged, and the wait time of 15 seconds plus 2 seconds reaches
  the Gamemaster's client as the query option `timeout`.
- The confirmation of the asking user (API `0.5.0`, a Gamemaster and a player in two sessions): the request of a player for
  `flightcontrol.gmping` runs on the Gamemaster's client only after that client has asked the player's client to
  confirm it; the result names the Gamemaster in `ranBy` and the player in `askedBy`. The player's client answers the
  question while its own request is still waiting. A Gamemaster who asks runs the request in their own client and is
  `askedBy` themselves. Three forged messages sent by hand to the Gamemaster's client are refused with
  `not-permitted` ("the asking user could not be confirmed"): one that names the Gamemaster, one that names a user who
  does not exist, and one that names the player with an identifier that was never issued. The Gamemaster's console
  logs the reason of each refusal (`the answer is not a confirmation from that user`, `the question failed: no user
  with the id …`); the caller gets only the general sentence.
- The rights (API `0.6.0`, a Gamemaster and a player in two sessions, 2026-09-20): a player for whom the
  Gamemaster has set no level gets `not-permitted` (`module "<id>" may not be used by this user`) for a request that
  runs in their own client (`flightcontrol.ping`) and for one that runs on the Gamemaster's client
  (`flightcontrol.gmping`; the Gamemaster's client refuses it and logs the reason). `getRights` answers `denied` for
  that player and `all` for the Gamemaster, whose requests all run. A request with a payload that does not fit is
  answered with `invalid-payload` before the rights are asked. In the hub the Gamemaster chooses the level per player
  and module (Denied, Own targets only, Own and foreign targets), and the choice is still there after a reload. With
  the level `own`, `getRights` answers `own`, `ping` and `gmping` run, and a `flightcontrol.targetping` is answered for a
  document the player owns and refused with `not-permitted` (`module "<id>" may act only on targets this user owns`)
  for a document they do not own, for a UUID of no document and for text that is not a UUID. With the level `all` the
  same request is answered for both documents. When the Gamemaster changes the level, the player's client answers with
  the new level at once, without a reload.
- The game system (API `0.7.0`, a Gamemaster, 2026-09-20): in the test world `game.system.id` is `dnd5e`
  and `game.system.version` is `5.3.3`, a strict `x.y.z` text, and both are filled in by the time of `ready`. When the
  world is ready Flight Control writes `eagleeye | game system: dnd5e 5.3.3 (tested)` to the console as an information
  line, and `getSystemInfo()` answers
  `{"ok":true,"value":{"id":"dnd5e","version":"5.3.3","status":"tested","testedVersions":["5.3.3"]}}`.
- The release build (module version `0.1.0`, API `0.7.0`, a Gamemaster and a player in two sessions, 2026-09-20): the
  module management window shows the version `0.1.0`, and registration, requests, rights and the game system line
  behave as in the checks above. A player for whom the Gamemaster has set the level `own` gets `ok` for
  `flightcontrol.gmping`, run by the Gamemaster's client and asked by the player. A request with version `99` is
  answered with `unsupported-version` (`request type "flightcontrol.ping" supports version 1, not 99`) and one without
  `module` with `invalid-request` (`request.module must be a non-empty string`); each is logged as a warning.
- A forwarded request that names a user who is not connected is refused with `not-permitted` ("the asking user could
  not be confirmed"); the Gamemaster's console logs the reason (`the question failed: User [<id>] is not active`).
- For a number setting with a range that has a minimum and a maximum, a value typed above the maximum is limited to the
  maximum by the number field of the slider before the hub sees it: the field jumps to the maximum, the `onChange` of
  the setting gets the maximum, and no notification appears.
- For a player, Foundry's settings window has no entry for Flight Control, so there is no "Open Eagle Flight Control"
  button: the hub is opened by the Gamemaster only.
- Observed with a test module (not Flight Control) on 2026-09-20: a query from the Gamemaster to a connected player is
  delivered and answered by that player's client (about 100 ms); a query to a user who is not connected fails at once
  (`User [<id>] is not active`); a query nobody handles fails at once (`User query '<name>' is not registered`); an
  error thrown by the handler comes back as a rejection with the same message; the query option `timeout` works
  (rejection `operation has timed out` after about the given time); a query to oneself works; a player can read a
  world setting that the Gamemaster has just written.
- What Foundry hands to a query handler: the query data and one extra argument, the query options (`{ timeout }`).
  It gives no information about the user who asked, so Flight Control cannot tell on the Gamemaster's side which user
  asked; the confirmation of the asking user (section 4) works around this by asking the named user's client to confirm the request.
- The language file loads from the manifest entry `languages`; the hub shows no raw text keys.

**Not verified in a running Foundry** (`unverified`):

- the relay (API `0.4.0`): the failure paths of the relay in Flight Control itself: `relay-timeout` and `relay-failed` (Foundry's own
  behaviour in these cases was observed with the test module, see above), and the behaviour with more than one
  Gamemaster connected (unit tests and a simulation only);
- the confirmation (API `0.5.0`): the wait of 5 seconds without an answer in Flight Control itself (Foundry's own
  behaviour was observed with the test module, see above; unit tests and a simulation only);
- the rights per module and user (API `0.6.0`): what Foundry's ownership test answers for a Gamemaster, for a document in a
  compendium and for the level Inherit; whether Foundry lets an Assistant write a world setting; the rights block for an
  Assistant, with more than one player and with more than one Gamemaster connected (unit tests and a simulation
  only);
- the game system (API `0.7.0`): the notification for a Gamemaster when the world is ready, the states `same-line`,
  `untested`, `other-system` and `unknown` in Foundry (the test world runs a tested version), and what a player sees
  (unit tests and a simulation only; check packages that make Flight Control read another value exist);
- the request type `compendium.create` (API `0.8.0`): whether Foundry accepts the names, what `createCompendium` needs
  (a Gamemaster, an Assistant), what a new world compendium looks like (`locked`, `ownership`), what happens when the same
  name is asked twice at the same moment, how long it takes, and whether `game.packs` has the new compendium as soon as the
  call returns (unit tests and a simulation only);
- what the hub does with a refused value: it resets the field and shows a notification (unit tests only; the number
  field of a slider limits a value typed above the maximum before the hub sees it, so this path cannot be triggered
  with such a field);
- the request failure reasons `handler-failed` and `internal-error` (unit tests only; `invalid-request` and `unsupported-version` were seen in Foundry);
- the order in which Foundry runs the `init` callbacks of Flight Control and of your module (this contract does
  not depend on it: you register in `setup`);
- what happens when Flight Control is deactivated in a way other than through the module management window (the window itself refuses it while an active module requires Flight Control);
- whether Foundry enforces `compatibility` ranges in `relationships.requires`.

## 9. Not part of this version

- Request types that read or change Foundry data other than `compendium.create`. They will be added in later versions of
  this contract.
- A limit on how many requests a client may send or have waiting (see "Forwarded requests" in section 4).

## 10. Change history

The text of this contract was consolidated on 2026-09-20 without any change to the API. "Part n" names the step of the
project in which a change was made; the earlier project documents use these names.

| API version | Change |
|---|---|
| `0.1.0` | Initial version: `version` and `registerModule`. |
| `0.2.0` | Part 2: optional `open` in the descriptor; the hub shows a tab per registered module with its settings and an Open button. |
| `0.3.0` | Part 3: `request` and the request kernel with one request type, `flightcontrol.ping`. |
| `0.4.0` | Part 4: every request type says where it runs; requests for types that run on the Gamemaster's client are forwarded to it; new failure reasons `no-gm`, `relay-timeout`, `relay-failed`, `not-permitted`; request type `flightcontrol.gmping`. |
| `0.5.0` | Part 5: a forwarded request carries the asking user and an identifier, and the Gamemaster's client runs it only after the client of that user has confirmed it; `not-permitted` also covers an unconfirmed user; `flightcontrol.gmping` reports `askedBy`. |
| `0.6.0` | Part 6: rights per module and user (`denied`, `own`, `all`), set by the Gamemaster in the hub and checked by the request kernel before a request runs; `not-permitted` also covers a refusal by the rights; a request type can name its target documents; new function `getRights`; request type `flightcontrol.targetping`. |
| `0.7.0` | Part 7: the game system guard: Flight Control tells a Gamemaster when the game system is not one it was tested with, and the new function `getSystemInfo` tells modules the id, the version and the status of the system; nothing is blocked. |
| `0.8.0` | Library milestone M3: the first request type that changes Foundry data, `compendium.create`; request types can be marked for a Gamemaster or Assistant only (`not-permitted` for everybody else, whatever the level), and `compendium.create` is; before `1.0.0` a new request type raises the minor version of the API. |

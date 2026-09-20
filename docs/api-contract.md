# Eagle Flight Control — API contract, parts 1 to 6: registration, the hub, requests, the Gamemaster relay, who asked and rights per module and user

**API version:** `0.6.0`
**Status:** development. Before `1.0.0` a minor version may break the API (see section 5).
**Scope of this version:** how an Eagle module gets the API and registers itself (part 1), how it appears in the
Flight Control hub: tab, settings and open action (part 2), and how it asks Flight Control to do things: the request
channel (part 3), and where a request runs: requests that need the Gamemaster's rights run on the Gamemaster's
client (part 4), and who asked: the Gamemaster's client confirms the asking user before it runs a forwarded request
(part 5), and who may use which module: the Gamemaster sets rights per module and user in the hub, and Flight Control
checks them before it runs a request (part 6). Later parts (system version guard) will extend the API and raise its
version.
**Audience:** authors of Eagle modules. Flight Control does not integrate third-party modules. Registration by a
third-party module is not a supported use; it cannot be prevented technically, and such a module would simply
count as registered.

## 1. Getting the API

Flight Control attaches its API to its own module object while it initializes:

```js
const api = game.modules.get("eagleeye")?.api;
```

- Read it from your **`setup` hook or later**. Before `setup` it may not exist yet, because the load order of
  modules is not documented.
- Always handle `undefined`: Flight Control can be missing or deactivated.
- The API object is frozen. It has exactly four members: `version`, `registerModule`, `request` and `getRights`.

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
    apiVersion: "0.6.0",
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

Additional fields are ignored; they are reserved for later parts of the contract. Title and version of your
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
types as proofs that the channels and the rights work; further request types come with the modules that need them.

```js
const result = await api.request({
  module: "my-eagle-module",
  type: "flightcontrol.ping",
  payload: { echo: "hello" },
});
if (result.ok) {
  console.log(result.value); // { apiVersion: "0.6.0", module: "my-eagle-module", echo: "hello" }
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
| `not-permitted` | The request was refused: the receiving side is not a Gamemaster's client, the request type is not run for other clients, the asking user could not be confirmed (see "Who asked"), or the rights per module and user do not allow it (see "Rights per module and user"). `detail` says which. | Do not retry. Ask `getRights` before you offer the action. |

Treat every reason you do not know as a failure: later parts of this contract may add reasons.

**Versions:** a request without `version` always means version `1`. A version of a request type stays supported as
long as its contract lists it, so a module keeps working when Flight Control adds a newer version. New request types
and new versions of a request type do not change the API version of this contract.

**Where a request runs:** every request type says where it runs (last table of this section). Most types run in
your own client, with the rights of the current user. A type that needs the Gamemaster's rights runs on the
Gamemaster's client: a user without a Gamemaster role (a player, a trusted player) does not need any Foundry
permission for it, because Flight Control sends the request to the connected Gamemaster and returns the answer. A user
with a Gamemaster role (Gamemaster or Assistant) runs every type in their own client.

**Forwarded requests**

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

**Who asked (forwarded requests)**

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

**Rights per module and user**

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
- **Refusals** come as `not-permitted`; `detail` says which rule: `module "<id>" may not be used by this user`,
  `module "<id>" may act only on targets this user owns`, `the user of this request is not known`, `the rights could
  not be read, so nothing is allowed until they can` (the stored rights are damaged: nobody but a Gamemaster or
  Assistant may do anything until the Gamemaster sets a level in the hub), or `the rights could not be checked`.
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
- **Rules for request types** (for the parts of this contract that add them): a type that acts on documents names them,
  otherwise `own` cannot restrict it. A type that belongs to one module has to state which modules may use it, because
  the rights are per module and `module` is only what the caller states. A type that runs on the Gamemaster's client
  and changes data or hands out knowledge only the Gamemaster has says how in the design of its milestone. The three
  types below do none of this.

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

Use `flightcontrol.ping` to check that the channel works, and `flightcontrol.gmping` to check that a request reaches
the Gamemaster's client: for a player it answers with the Gamemaster's `userId` in `ranBy` and the player's own id in
`askedBy`, or with `no-gm` if no Gamemaster is connected. Use `flightcontrol.targetping` to see the rights for own and
foreign targets: with the level `own` it answers for a document the user owns and refuses every other with
`not-permitted`; with `all` it answers for both.

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

The API version is independent of the module version in `module.json`.

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
- **Module version and API version:** no released Flight Control contains this API yet; the current release
  `v13-v0.0.1` predates it. A table of module versions and the API version each provides will be published with
  the first release that contains the API. Until then use the development version `0.0.1` as `minimum`.
- **Texts and files:** Flight Control ships `lang/en.json` and lists it under `languages` in its manifest. A package
  that leaves `lang/` out shows raw text keys in the hub.

## 7. Behaviour when Flight Control is missing or deactivated

- **Not installed:** according to Foundry's documentation your module cannot be enabled (see section 6).
- **Installed but deactivated:** what Foundry does is **not verified**. Your code has to handle
  `api === undefined` in any case.

## 8. What is verified

The version rules, the registry, the shape of the API object, the logic behind the hub (tabs, settings, saving, open
action), the request kernel (envelope checks, sender check, handlers, versions, JSON rule, results), the relay
(where a request runs, forwarding, the Gamemaster's side, limits, failure reasons) and the rights (levels, the check,
what the hub's rights block shows and writes, `getRights`) are covered by unit tests of the pure logic.

**Verified in a running Foundry** (Foundry v13, build 351, on Forge, a dnd5e world; four test modules; live checks on
2026-09-19 with API `0.3.0` and on 2026-09-20 with API `0.4.0`, `0.5.0` and `0.6.0`):

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
- Part 4, the relay: a request for a type that runs on the Gamemaster's client (`flightcontrol.gmping`) from a player
  is forwarded to the connected Gamemaster, and the result comes back with `ranBy` naming the Gamemaster's user, not the
  player's. Without a connected Gamemaster the request returns `no-gm`. A Gamemaster who asks runs it in their own
  client. The results (with a nested object) arrive unchanged, and the wait time of 15 seconds plus 2 seconds reaches
  the Gamemaster's client as the query option `timeout`.
- Part 5, the confirmation (API `0.5.0`, a Gamemaster and a player in two sessions): the request of a player for
  `flightcontrol.gmping` runs on the Gamemaster's client only after that client has asked the player's client to
  confirm it; the result names the Gamemaster in `ranBy` and the player in `askedBy`. The player's client answers the
  question while its own request is still waiting. A Gamemaster who asks runs the request in their own client and is
  `askedBy` themselves. Three forged messages sent by hand to the Gamemaster's client are refused with
  `not-permitted` ("the asking user could not be confirmed"): one that names the Gamemaster, one that names a user who
  does not exist, and one that names the player with an identifier that was never issued. The Gamemaster's console
  logs the reason of each refusal (`the answer is not a confirmation from that user`, `the question failed: no user
  with the id …`); the caller gets only the general sentence.
- Part 6, the rights (API `0.6.0`, a Gamemaster and a player in two sessions, 2026-09-20): a player for whom the
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
- Observed with a test module (not Flight Control) on 2026-09-20: a query from the Gamemaster to a connected player is
  delivered and answered by that player's client (about 100 ms); a query to a user who is not connected fails at once
  (`User [<id>] is not active`); a query nobody handles fails at once (`User query '<name>' is not registered`); an
  error thrown by the handler comes back as a rejection with the same message; the query option `timeout` works
  (rejection `operation has timed out` after about the given time); a query to oneself works; a player can read a
  world setting that the Gamemaster has just written.
- What Foundry hands to a query handler: the query data and one extra argument, the query options (`{ timeout }`).
  It gives no information about the user who asked, so Flight Control cannot tell on the Gamemaster's side which user
  asked; part 5 works around this by asking the named user's client to confirm the request.
- The language file loads from the manifest entry `languages`; the hub shows no raw text keys.

**Not verified in a running Foundry** (`unverified`):

- part 4, the failure paths of the relay in Flight Control itself: `relay-timeout` and `relay-failed` (Foundry's own
  behaviour in these cases was observed with the test module, see above), and the behaviour with more than one
  Gamemaster connected (unit tests and a simulation only);
- part 5, the failure paths of the confirmation in Flight Control itself: a named user who is not connected, and the
  wait of 5 seconds without an answer (Foundry's own behaviour in these cases was observed with the test module, see
  above; unit tests and a simulation only);
- part 6, the rights per module and user: what Foundry's ownership test answers for a Gamemaster, for a document in a
  compendium and for the level Inherit; whether Foundry lets an Assistant write a world setting; the rights block for an
  Assistant, with more than one player and with more than one Gamemaster connected (unit tests and a simulation
  only);
- what the hub does with a refused value: it resets the field and shows a notification (unit tests only); for a number
  with a range the slider element may limit a value typed above the maximum itself (not confirmed); how the hub looks
  for a player (the menu is restricted to the Gamemaster);
- the request failure reasons `invalid-request`, `unsupported-version`, `handler-failed` and `internal-error` (unit tests only);
- the order in which Foundry runs the `init` callbacks of Flight Control and of your module (this contract does
  not depend on it: you register in `setup`);
- what happens when a required module is installed but deactivated;
- whether Foundry enforces `compatibility` ranges in `relationships.requires`.

## 9. Not part of this version

Request types that read or change Foundry data (only the three proofs exist) and the system version guard. They will
be added in later parts of this contract.

## 10. Change history

| API version | Change |
|---|---|
| `0.1.0` | Initial version: `version` and `registerModule`. |
| `0.2.0` | Part 2: optional `open` in the descriptor; the hub shows a tab per registered module with its settings and an Open button. |
| `0.3.0` | Part 3: `request` and the request kernel with one request type, `flightcontrol.ping`. |
| `0.4.0` | Part 4: every request type says where it runs; requests for types that run on the Gamemaster's client are forwarded to it; new failure reasons `no-gm`, `relay-timeout`, `relay-failed`, `not-permitted`; request type `flightcontrol.gmping`. |
| `0.5.0` | Part 5: a forwarded request carries the asking user and an identifier, and the Gamemaster's client runs it only after the client of that user has confirmed it; `not-permitted` also covers an unconfirmed user; `flightcontrol.gmping` reports `askedBy`. |
| `0.6.0` | Part 6: rights per module and user (`denied`, `own`, `all`), set by the Gamemaster in the hub and checked by the request kernel before a request runs; `not-permitted` also covers a refusal by the rights; a request type can name its target documents; new function `getRights`; request type `flightcontrol.targetping`. |

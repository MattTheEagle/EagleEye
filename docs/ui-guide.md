# Eagle modules — UI guide

**Status:** development, written together with the Flight Control hub (API contract `0.2.0`).
**Audience:** authors of Eagle modules.
**Goal:** every Eagle module looks and behaves like Foundry itself: the same buttons, the same fonts, the same forms.
The decision behind it is to use Foundry's own building blocks and to write this guide, instead of building a shared
UI library.

## 1. Principles

- Use only Foundry's building blocks. No own design system, no own colors or fonts.
- Every rule below names its evidence. **Foundry reference** means a place in the Foundry v13 type reference
  (`foundry-vtt-reference-v13/types/src/foundry/`, tag `v13.345.1`), given as `path:line`. **Used in the hub** means the
  place in this repository that uses it, given as `file#symbol`. Every rule has at least one of the two.
- "Backed" means the rule rests on the reference or on code in the hub. Whether the result also *looks* native in a
  running Foundry is checked live; section 4 says what has been checked.

## 2. Rules

| # | Rule | Why | Foundry reference | Used in the hub |
|---|---|---|---|---|
| R-01 | Every window is an `ApplicationV2` (`foundry.applications.api.ApplicationV2`). | It is Foundry's current window framework and brings the native frame, tabs and actions. | `client/applications/api/_module.d.mts:6` `client/applications/api/application.d.mts:125` | `v13/hub-application.ts#ApplicationV2` |
| R-02 | Give the window a stable `id`, a localization key as `window.title` and a Font Awesome `window.icon`. | A stable id lets Foundry track the window; a key keeps the title translatable. | `client/applications/api/application.d.mts:125` `client/applications/api/application.d.mts:198` | `v13/hub-application.ts#DEFAULT_OPTIONS` |
| R-03 | Handle clicks with `actions` and `data-action`, not with inline handlers or global listeners. | Foundry binds the handler to the window and cleans up with it. | `client/applications/api/application.d.mts:159` | `v13/hub-application.ts#onOpenModule` |
| R-04 | Build tabs with `tabGroups` and `_prepareTabs`, and render the navigation with Foundry's core template `templates/generic/tab-navigation.hbs`. Mark each tab body with `data-group` and `data-tab`. | The core template produces the native tab bar, and `changeTab` switches between tab bodies. | `client/applications/api/application.d.mts:348` `client/applications/api/application.d.mts:377` `client/applications/api/application.d.mts:554` `client/applications/api/application.d.mts:663` | `v13/hub-application.ts#NAV_TEMPLATE` |
| R-05 | Create inputs with Foundry's field helpers (`foundry.applications.fields`), not with handwritten markup. For a number with a range use `foundry.applications.elements.HTMLRangePickerElement.create` (a slider with a number field). | The helpers produce the native input elements; the range picker is what Foundry's settings window shows for a range. | `client/applications/forms/fields.d.mts:137` `client/applications/forms/fields.d.mts:170` `client/applications/forms/fields.d.mts:231` `client/applications/elements/range-picker.d.mts:30` | `v13/hub-application.ts#createCheckboxInput` `v13/hub-application.ts#HTMLRangePickerElement` |
| R-06 | Put label, input and hint together with `createFormGroup`, and give the window content the class `standard-form` through the window option `contentClasses`. | `createFormGroup` produces Foundry's form-group markup; the class arranges label and field side by side, as in Foundry's settings window. Without the class the groups are stacked, with the label above the field. | `client/applications/forms/fields.d.mts:132` `client/applications/api/application.d.mts:239` | `v13/hub-application.ts#createFormGroup` `v13/hub-application.ts#DEFAULT_OPTIONS` |
| R-07 | Never concatenate data into `innerHTML`. Use helpers, `textContent`, `dataset` or Foundry templates; to turn the output of a Foundry template into DOM use `foundry.utils.parseHTML`. | Strings from settings or module manifests can contain markup; the first Flight Control hub concatenated them unescaped (Git commit `77daf6d`). | `client/utils/helpers.d.mts:187` | `v13/hub-application.ts#parseHTML` |
| R-08 | Ask for confirmations and short inputs with `DialogV2`. | It is Foundry's native dialog. | `client/applications/api/dialog.d.mts:175` `client/applications/api/dialog.d.mts:198` | — |
| R-09 | Put every user-visible text into `lang/<code>.json`, list the file under `languages` in the manifest and read it with `game.i18n`. The language of the interface is English. | Foundry loads the files and localizes keys; a missing file shows raw keys, which is visible. | `common/packages/base-package.d.mts:337` `client/helpers/localization.d.mts:127` | `v13/hub-application.ts#EAGLEEYE.hub.title` |
| R-10 | Offer an entry point as a settings menu with `game.settings.registerMenu` (a constructor without arguments; `restricted: true` for Gamemaster-only). | It appears in Foundry's own settings window where users look for module tools. | `client/helpers/client-settings.d.mts:139` `client/helpers/client-settings.d.mts:331` | `v13/module.ts#registerMenu` |
| R-11 | Report results and errors with `ui.notifications`. | It is Foundry's native message channel. | `client/applications/ui/notifications.d.mts:63` | `v13/module.ts#notifications` |
| R-12 | Settings that should appear in the Flight Control hub: register them with `config: true` and a type of `Boolean`, `String` (with `choices`) or `Number` (with `range`); mark `requiresReload` where it applies. | The hub shows and edits exactly these; other types are listed as not editable. | `client/helpers/client-settings.d.mts:283` `client/helpers/client-settings.d.mts:289` `client/helpers/client-settings.d.mts:296` `client/helpers/client-settings.d.mts:308` | `core/settings-hub.ts#listHubSettings` |
| R-13 | Do not ship an own look (colors, fonts, spacing). If extra CSS is unavoidable, add it through `styles` in the manifest, limit it to a class of your own and check it in a running Foundry. | The native look is the goal; CSS behavior is **not covered by the reference**. | `common/packages/base-package.d.mts:332` | — |
| R-14 | Do not repeat the name of a module as a heading inside its tab: the highlighted tab already names it. Group a sub-block of a tab (for example who may use the module) in a native `fieldset` with a `legend`. | Seen live (2026-09-20, dark theme): a heading (`h3`) right under the tab bar was shown large and too close to it, and the same block as a `fieldset` with the module name as `legend` still sat too close. Without a heading the tab looks right, and a `fieldset` with a `legend` further down, for a sub-block, looks right; the project lead accepted it. | `fieldset` and `legend` are standard HTML; the reference contains no HTML | `v13/hub-application.ts#renderRights` |

## 3. Checklist for a new module window

- [ ] It is an `ApplicationV2` with a stable `id`, a localized title key and an icon (R-01, R-02).
- [ ] Clicks go through `actions` (R-03).
- [ ] Tabs use the core navigation template (R-04).
- [ ] Inputs come from the field helpers and sit in a form group; the window content has the class `standard-form` (R-05, R-06).
- [ ] No data is concatenated into `innerHTML` (R-07).
- [ ] Texts are keys in `lang/en.json`, and the file is listed in the manifest and in your zip (R-09).
- [ ] The window opens from a settings menu or from the Flight Control hub (R-10, contract section 2).
- [ ] Settings you want in the hub use `config: true` and a supported type (R-12).
- [ ] No custom CSS, or it is scoped and checked live (R-13).
- [ ] No heading repeats the name of the module inside its tab; a sub-block is a `fieldset` with a `legend` (R-14).

## 4. What is verified

All rules are backed by the Foundry reference or by code in the hub (section 1). The hub has also been opened in a
running Foundry (v13, build 351, on Forge, dark theme; 2026-09-19 and 2026-09-20).

**Verified in a running Foundry**

- R-01 to R-03: the hub is an `ApplicationV2` window with title, icon, close button and resize handle; the Open button works through `actions`.
- R-04: the convention works. The core navigation template renders the tab bar, and `changeTab` switches the tab bodies
  that carry `data-group` and `data-tab`. Switching a tab does not render the window again. The active tab is
  highlighted (seen by the project lead, 2026-09-20).
- R-05: the field helpers produce working inputs (checkbox, select list, text field), and a change reaches the setting.
  A number with a range shown through `HTMLRangePickerElement.create` is a slider with a number field, as in Foundry's
  settings window.
- R-06: with `contentClasses: ["standard-form"]` the form groups are arranged like in Foundry's settings window (label
  on the left, field on the right, hint below the label). In the first live test (2026-09-19), without the class, the
  groups were stacked, with the label above the field.
- R-09, R-10, R-12: the language file loads and no raw keys appear; the settings menu shows one entry; settings with the
  supported types appear, and none is reported as not editable.
- R-14: the tab without a heading and without a frame, and below the settings a `fieldset` with the legend "Who may use
  this module" holding one select list per player in `standard-form` form groups, were seen live on 2026-09-20 (as a
  Gamemaster, dark theme) and accepted by the project lead. The chosen level was still there after a reload (project
  lead: no change after a reload).

**Observed, no rule yet**

- Nothing at the moment. (The observation about headings in a `standard-form` window became R-14.)

**Not yet verified in a running Foundry** (`unverified`)

- everything about CSS (R-13): the reference contains no CSS;
- what the hub does with a value above the maximum typed into the range picker (a limit by the element is likely, not
  confirmed), and how the hub looks for a player;
- how the rights block behaves for an Assistant (it is meant to be hidden; not tried) and with more than one player.

This section is updated after each live test.

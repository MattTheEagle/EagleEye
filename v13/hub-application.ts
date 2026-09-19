import type { ApiLogger } from "../core/eagle-api";
import { buildHubModel, startModule } from "../core/hub-model";
import type { ModuleRegistry, RegisteredModule } from "../core/module-registry";
import { applySettingInput, listHubSettings, type HubSetting, type HubSettingsSource } from "../core/settings-hub";

const { ApplicationV2 } = foundry.applications.api;
const fields = foundry.applications.fields;

type Tab = foundry.applications.api.ApplicationV2.Tab;

const TAB_GROUP = "primary";
// Foundry core template that renders the tab navigation for the tabs returned by _prepareTabs.
const NAV_TEMPLATE = "templates/generic/tab-navigation.hbs";

export interface HubContext {
  registry: ModuleRegistry;
  settings: HubSettingsSource;
  text(key: string, data?: Record<string, string>): string;
  notify(level: "info" | "warn" | "error", message: string): void;
  log: ApiLogger;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

// The hub window. The window is a plain ApplicationV2 without template files of its own: the tab navigation comes
// from Foundry's core template, everything else is built with Foundry's field helpers and DOM calls, never from
// concatenated HTML strings. The class closes over its context, so registerMenu can construct it without arguments.
export function createHubApplicationClass(context: HubContext) {
  async function onOpenModule(_event: PointerEvent, target: HTMLElement): Promise<void> {
    const entry = context.registry.list().find((module) => module.id === target.dataset.moduleId);
    if (!entry) return;
    const result = await startModule(entry);
    if (!result.ok) {
      context.log.warn(`eagleeye | open failed for ${entry.id}: ${result.reason} - ${result.detail}`);
      context.notify(
        "error",
        context.text("EAGLEEYE.hub.notify.openFailed", { module: entry.title, detail: result.detail }),
      );
    }
  }

  return class EagleHubApplication extends ApplicationV2 {
    static override DEFAULT_OPTIONS = {
      id: "eagleeye-hub",
      window: { title: "EAGLEEYE.hub.title", icon: "fa-solid fa-eye", resizable: true },
      position: { width: 640 },
      actions: { openModule: onOpenModule },
    };

    // The settings currently shown, by "namespace.key" (the name of their input).
    readonly #shown = new Map<string, HubSetting>();

    protected override _prepareTabs(group: string): Record<string, Tab> {
      const model = buildHubModel(context.registry.list(), this.tabGroups[group]);
      this.tabGroups[group] = model.activeTabId;
      const tabs: Record<string, Tab> = {};
      for (const tab of model.tabs) {
        const active = tab.id === model.activeTabId;
        tabs[tab.id] = { id: tab.id, group, active, cssClass: active ? "active" : "", label: tab.label };
      }
      return tabs;
    }

    protected override async _renderHTML(): Promise<HTMLElement> {
      const modules = context.registry.list();
      const tabs = this._prepareTabs(TAB_GROUP);
      const activeId = this.tabGroups[TAB_GROUP] ?? null;
      const root = element("div");
      const notEditable: string[] = [];
      this.#shown.clear();

      if (modules.length === 0) {
        root.append(element("p", context.text("EAGLEEYE.hub.empty")));
      } else {
        const nav = foundry.utils.parseHTML(
          await foundry.applications.handlebars.renderTemplate(NAV_TEMPLATE, { tabs }),
        );
        if (nav instanceof HTMLElement) root.append(nav);
        else root.append(...Array.from(nav));
        for (const module of modules) {
          root.append(this.#renderModule(module, module.id === activeId, notEditable));
        }
      }

      context.log.info(`eagleeye | hub rendered: ${modules.length} tab(s)`);
      for (const line of notEditable) context.log.info(line);
      return root;
    }

    protected override _replaceHTML(result: HTMLElement, content: HTMLElement): void {
      content.replaceChildren(result);
    }

    protected override async _onRender(): Promise<void> {
      for (const input of this.element.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "input[name], select[name]",
      )) {
        input.addEventListener("change", () => void this.#onSettingChange(input));
      }
    }

    #renderModule(module: RegisteredModule, active: boolean, notEditable: string[]): HTMLElement {
      const section = element("section");
      section.classList.add("tab");
      if (active) section.classList.add("active");
      section.dataset.group = TAB_GROUP;
      section.dataset.tab = module.id;

      section.append(element("h3", module.title));
      section.append(
        element(
          "p",
          context.text("EAGLEEYE.hub.version", { version: module.version, apiVersion: module.apiVersion }),
        ),
      );
      if (module.open) {
        const button = element("button", context.text("EAGLEEYE.hub.open"));
        button.type = "button";
        button.dataset.action = "openModule";
        button.dataset.moduleId = module.id;
        section.append(button);
      }

      const settings = listHubSettings(module.id, context.settings);
      if (settings.length === 0) section.append(element("p", context.text("EAGLEEYE.hub.noSettings")));
      for (const setting of settings) {
        this.#shown.set(`${setting.namespace}.${setting.key}`, setting);
        if (setting.kind === "unsupported") {
          notEditable.push(
            `eagleeye | hub: ${setting.namespace}.${setting.key} is not editable (type ${setting.typeName})`,
          );
        }
        section.append(this.#renderSetting(setting));
      }
      return section;
    }

    #renderSetting(setting: HubSetting): HTMLElement {
      const hint = [
        setting.hint,
        setting.kind === "unsupported" ? context.text("EAGLEEYE.hub.notEditable") : undefined,
        setting.requiresReload ? context.text("EAGLEEYE.hub.requiresReload") : undefined,
      ]
        .filter((part): part is string => Boolean(part))
        .join(" ");
      return fields.createFormGroup({ label: setting.label, hint, input: this.#createInput(setting) });
    }

    #createInput(setting: HubSetting): HTMLElement {
      const name = `${setting.namespace}.${setting.key}`;
      switch (setting.kind) {
        case "boolean":
          return fields.createCheckboxInput({ name, value: setting.value === true });
        case "number": {
          const value = typeof setting.value === "number" && Number.isFinite(setting.value) ? setting.value : undefined;
          return fields.createNumberInput({
            name,
            value,
            min: setting.range?.min,
            max: setting.range?.max,
            step: setting.range?.step,
          });
        }
        case "string": {
          const value = typeof setting.value === "string" ? setting.value : String(setting.value ?? "");
          if (setting.choices) {
            const options = setting.choices.map((choice) => ({ value: choice.value, label: choice.label }));
            return fields.createSelectInput({ name, value, options });
          }
          return fields.createTextInput({ name, value });
        }
        default:
          return element("span");
      }
    }

    async #onSettingChange(input: HTMLInputElement | HTMLSelectElement): Promise<void> {
      const setting = this.#shown.get(input.name);
      if (!setting) return;
      const isCheckbox = input instanceof HTMLInputElement && input.type === "checkbox";
      const raw = isCheckbox ? input.checked : input.value;

      const result = await applySettingInput(
        setting.namespace,
        setting.key,
        raw,
        context.registry.list().map((module) => module.id),
        context.settings,
      );
      if (result.ok) return;

      context.log.warn(
        `eagleeye | hub could not save ${setting.namespace}.${setting.key}: ${result.reason} - ${result.detail}`,
      );
      // Show the stored value again and tell the user why nothing changed.
      const stored = context.settings.get(setting.namespace, setting.key);
      if (isCheckbox) (input as HTMLInputElement).checked = stored === true;
      else input.value = String(stored ?? "");
      const message =
        result.reason === "not-permitted"
          ? context.text("EAGLEEYE.hub.notify.notPermitted")
          : result.reason === "invalid-value"
            ? context.text("EAGLEEYE.hub.notify.invalidValue", { name: setting.label, detail: result.detail })
            : context.text("EAGLEEYE.hub.notify.writeFailed", { name: setting.label });
      context.notify("warn", message);
    }
  };
}

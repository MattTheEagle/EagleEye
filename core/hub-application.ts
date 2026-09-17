import { listSettings, updateSetting, type SettingEntry } from "./settings-hub";

const { ApplicationV2 } = foundry.applications.api;

function renderRow(entry: SettingEntry): string {
  const inputId = `eagleeye-hub-${entry.namespace}-${entry.key}`;
  const input =
    typeof entry.value === "boolean"
      ? `<input type="checkbox" id="${inputId}" data-namespace="${entry.namespace}" data-key="${entry.key}" data-type="boolean" ${entry.value ? "checked" : ""}>`
      : `<input type="text" id="${inputId}" data-namespace="${entry.namespace}" data-key="${entry.key}" data-type="string" value="${String(entry.value ?? "")}">`;

  return `
    <tr>
      <td>${entry.namespace}.${entry.key}</td>
      <td>${entry.name}</td>
      <td>${entry.scope}</td>
      <td>${input}</td>
    </tr>
  `;
}

export class HubApplication extends ApplicationV2 {
  static override DEFAULT_OPTIONS = {
    id: "eagleeye-hub",
    window: { title: "EagleEye Hub" },
  };

  protected override async _renderHTML(): Promise<string> {
    const rows = listSettings().map(renderRow).join("");
    return `
      <table class="eagleeye-hub-table">
        <thead>
          <tr><th>Namespace.Key</th><th>Name</th><th>Scope</th><th>Value</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  protected override _replaceHTML(result: string, content: HTMLElement): void {
    content.innerHTML = result;
  }

  protected override async _onRender(): Promise<void> {
    this.element.querySelectorAll<HTMLInputElement>("input[data-namespace]").forEach((input) => {
      input.addEventListener("change", () => {
        const { namespace, key, type } = input.dataset;
        if (!namespace || !key) return;
        const value = type === "boolean" ? input.checked : input.value;
        void updateSetting(namespace, key, value);
      });
    });
  }
}

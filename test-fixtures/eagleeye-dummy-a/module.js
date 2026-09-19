Hooks.once("init", () => {
  game.settings.register("eagleeye-dummy-a", "enabled", {
    name: "Dummy A Enabled",
    hint: "A client-scope boolean.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      console.log(`eagleeye-dummy-a | enabled changed to ${value}`);
    },
  });

  game.settings.register("eagleeye-dummy-a", "mode", {
    name: "Dummy A Mode",
    hint: "A world-scope string with choices.",
    scope: "world",
    config: true,
    type: String,
    choices: { alpha: "Alpha", beta: "Beta" },
    default: "alpha",
    onChange: (value) => {
      console.log(`eagleeye-dummy-a | mode changed to ${value}`);
    },
  });

  game.settings.register("eagleeye-dummy-a", "level", {
    name: "Dummy A Level",
    hint: "A client-scope number with a range.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 10, step: 1 },
    default: 5,
    onChange: (value) => {
      console.log(`eagleeye-dummy-a | level changed to ${value}`);
    },
  });

  game.settings.register("eagleeye-dummy-a", "needsReload", {
    name: "Dummy A Needs Reload",
    hint: "A world-scope boolean that requires a reload.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });
});

// Registers with Flight Control (API 0.3.0) and provides an open action (expected result: ok).
Hooks.once("setup", () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) {
    console.warn("eagleeye-dummy-a | Flight Control API not available");
    return;
  }
  const result = api.registerModule({
    id: "eagleeye-dummy-a",
    apiVersion: "0.3.0",
    open: () => {
      ui.notifications.info("eagleeye-dummy-a: open action called");
    },
  });
  console.log("eagleeye-dummy-a | registerModule result", result);
});

// Asks Flight Control for a ping after every module has registered (expected result: ok with apiVersion, module and echo).
Hooks.once("ready", async () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) return;
  const result = await api.request({
    module: "eagleeye-dummy-a",
    type: "flightcontrol.ping",
    payload: { echo: "hello" },
  });
  console.log("eagleeye-dummy-a | ping result", result);
});

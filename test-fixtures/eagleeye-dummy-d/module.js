Hooks.once("init", () => {
  game.settings.register("eagleeye-dummy-d", "note", {
    name: "Dummy D Note",
    hint: "A client-scope string without choices.",
    scope: "client",
    config: true,
    type: String,
    default: "hello",
    onChange: (value) => {
      console.log(`eagleeye-dummy-d | note changed to ${value}`);
    },
  });
});

// Registers with Flight Control (API 0.6.0) without an open action: its tab has no Open button.
Hooks.once("setup", () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) {
    console.warn("eagleeye-dummy-d | Flight Control API not available");
    return;
  }
  const result = api.registerModule({ id: "eagleeye-dummy-d", apiVersion: "0.6.0" });
  console.log("eagleeye-dummy-d | registerModule result", result);
});

// Sends two faulty requests after every module has registered
// (expected: reason "unknown-request" for the first, "invalid-payload" for the second).
Hooks.once("ready", async () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) return;
  const unknown = await api.request({ module: "eagleeye-dummy-d", type: "nope.nothing" });
  console.log("eagleeye-dummy-d | unknown request result", unknown);
  const invalid = await api.request({
    module: "eagleeye-dummy-d",
    type: "flightcontrol.ping",
    payload: { echo: 5 },
  });
  console.log("eagleeye-dummy-d | invalid payload result", invalid);
});

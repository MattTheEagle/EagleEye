// Registers with an incompatible API version (expected result: ok false, reason "incompatible-api-version").
Hooks.once("setup", () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) {
    console.warn("eagleeye-dummy-c | Flight Control API not available");
    return;
  }
  const result = api.registerModule({ id: "eagleeye-dummy-c", apiVersion: "9.0.0" });
  console.log("eagleeye-dummy-c | registerModule result", result);
});

// Asks for a ping although its registration was rejected (expected result: ok false, reason "not-registered").
Hooks.once("ready", async () => {
  const api = game.modules.get("eagleeye")?.api;
  if (!api) return;
  const result = await api.request({ module: "eagleeye-dummy-c", type: "flightcontrol.ping" });
  console.log("eagleeye-dummy-c | ping result", result);
});

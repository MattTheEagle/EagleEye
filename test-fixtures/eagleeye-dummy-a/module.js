Hooks.once("init", () => {
  game.settings.register("eagleeye-dummy-a", "enabled", {
    name: "Dummy A Enabled",
    hint: "Test-Setting fuer den EagleEye-Hub-Proof (M4).",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      console.log(`eagleeye-dummy-a | enabled changed to ${value}`);
    },
  });
});

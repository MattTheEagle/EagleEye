Hooks.once("init", () => {
  game.settings.register("eagleeye-dummy-b", "label", {
    name: "Dummy B Label",
    hint: "Test-Setting fuer den EagleEye-Hub-Proof (M4).",
    scope: "world",
    config: true,
    type: String,
    default: "initial",
    onChange: (value) => {
      console.log(`eagleeye-dummy-b | label changed to "${value}"`);
    },
  });
});

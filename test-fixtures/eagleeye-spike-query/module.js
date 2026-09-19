// Diagnostic fixture for the M6 spike: how does User#query behave from the Gamemaster to a player, to itself, to a user
// who is not connected, and when the handler throws, is missing or is too slow? It does not need Flight Control.
// Every client answers the three queries below; the checks run on the Gamemaster's client.
const SPIKE = "eagleeye-spike-query";
const say = (text) => console.log(`${SPIKE} | ${text}`);

Hooks.once("init", () => {
  // A world setting that the Gamemaster writes; the answer of a player shows whether the player's client can read it.
  game.settings.register(SPIKE, "probe", { scope: "world", config: false, type: String, default: "initial" });

  // Answered on the client that is queried: logs what it receives and says who it is.
  CONFIG.queries[`${SPIKE}.echo`] = async (data, ...extra) => {
    const probe = game.settings.get(SPIKE, "probe");
    say(`echo received on ${game.user.name} (id ${game.user.id}, GM: ${game.user.isGM}): data ${JSON.stringify(data)}, extra arguments ${JSON.stringify(extra)}, world setting probe "${probe}"`);
    return { answeredBy: { id: game.user.id, name: game.user.name, isGM: game.user.isGM }, got: data, probe };
  };
  // A handler that throws.
  CONFIG.queries[`${SPIKE}.boom`] = async () => {
    throw new Error("boom from the handler");
  };
  // A handler that answers only after twelve seconds.
  CONFIG.queries[`${SPIKE}.slow`] = async () => {
    await new Promise((resolve) => setTimeout(resolve, 12000));
    return { slow: "done" };
  };
});

async function attempt(label, user, name, data, timeout) {
  const started = Date.now();
  try {
    const result = await user.query(`${SPIKE}.${name}`, data, { timeout });
    say(`${label}: ok after ${Date.now() - started} ms -> ${JSON.stringify(result)}`);
  } catch (error) {
    say(`${label}: FAILED after ${Date.now() - started} ms -> ${error?.name ?? typeof error}: ${error?.message ?? error}`);
  }
}

async function run() {
  if (!game.user.isGM) {
    say("run() is meant for the Gamemaster's client");
    return;
  }
  const others = game.users.filter((user) => user.id !== game.user.id);
  say(`users: ${game.users.map((user) => `${user.name} (${user.id}, ${user.isGM ? "GM" : "player"}, active: ${user.active})`).join("; ")}`);
  const player = others.find((user) => !user.isGM && user.active);
  const away = others.find((user) => !user.active);
  say("--- start of the checks");

  await attempt("self (the Gamemaster asks itself)", game.user, "echo", { case: "self" }, 8000);

  if (player) {
    const nonce = Math.random().toString(36).slice(2);
    // The Gamemaster writes the world setting first; the player's answer must show the same value.
    await game.settings.set(SPIKE, "probe", `set-by-gm-${nonce}`);
    say(`the Gamemaster wrote the world setting probe = "set-by-gm-${nonce}"`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await attempt(`player ${player.name} (connected): echo with nonce ${nonce}`, player, "echo", { case: "gm-to-player", nonce }, 8000);
    await attempt(`player ${player.name}: handler that throws`, player, "boom", {}, 8000);
    await attempt(`player ${player.name}: query name nobody handles`, player, "nothing", {}, 8000);
    await attempt(`player ${player.name}: slow handler, timeout 3000 ms`, player, "slow", {}, 3000);
  } else {
    say("no connected player: connect a player and call the checks again (see the instructions)");
  }

  if (away) await attempt(`user ${away.name} (NOT connected): echo`, away, "echo", { case: "not-connected" }, 8000);
  else say("no unconnected user in this world: disconnect the player and call the checks again to test that case");

  say("--- end of the checks");
}

Hooks.once("ready", () => {
  game.modules.get(SPIKE).api = { run };
  if (!game.user.isGM) return;
  say("ready. The checks start by themselves in 10 seconds; call them again with: await game.modules.get('eagleeye-spike-query').api.run()");
  setTimeout(run, 10000);
});

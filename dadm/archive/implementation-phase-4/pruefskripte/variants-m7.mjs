// What each live-check package of M7 changes in the built bundle: only what the guard reads from game.system.
export const VARIANTS = {
  standard: [],
  "same-line": [["    version: () => game.system?.version", '    version: () => "5.3.4"']],
  untested: [["    version: () => game.system?.version", '    version: () => "5.4.0"']],
  "other-system": [["    id: () => game.system?.id,", '    id: () => "pf2e",']],
  unknown: [["    version: () => game.system?.version", '    version: () => "5.3.3-rc.1"']],
};
export function patchBundle(variant, text) {
  let out = text;
  for (const [from, to] of VARIANTS[variant]) {
    if (out.split(from).length - 1 !== 1) throw new Error(`variant ${variant}: the text to patch is not there exactly once`);
    out = out.replace(from, () => to);
  }
  return out;
}

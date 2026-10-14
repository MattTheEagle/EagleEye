import { describe, expect, it, vi } from "vitest";
import type { RegisteredModule } from "./module-registry";
import { PLAYER_CHARACTER_EDIT_MODULE_ID, startPlayerCharacterCreate } from "./player-hub";

function module(id: string, open?: () => void | Promise<void>): RegisteredModule {
  return { id, title: id, version: "1.0.0", apiVersion: "0.15.0", ...(open ? { open } : {}) };
}

describe("Player Hub character creation action", () => {
  it("opens only the fixed Character Edit registration", async () => {
    const openCharacterEdit = vi.fn();
    const openOther = vi.fn();
    const registry = {
      list: () => [module("eagle-library", openOther), module(PLAYER_CHARACTER_EDIT_MODULE_ID, openCharacterEdit)],
    };

    await expect(startPlayerCharacterCreate(registry)).resolves.toEqual({ ok: true });
    expect(openCharacterEdit).toHaveBeenCalledOnce();
    expect(openOther).not.toHaveBeenCalled();
  });

  it("has no fallback opener and returns only an opaque unavailable result", async () => {
    const openOther = vi.fn();
    await expect(startPlayerCharacterCreate({ list: () => [module("eagle-library", openOther)] })).resolves.toEqual({ ok: false });
    await expect(startPlayerCharacterCreate({ list: () => [module(PLAYER_CHARACTER_EDIT_MODULE_ID)] })).resolves.toEqual({ ok: false });
    await expect(
      startPlayerCharacterCreate({ list: () => [module(PLAYER_CHARACTER_EDIT_MODULE_ID, () => { throw new Error("detail"); })] }),
    ).resolves.toEqual({ ok: false });
    expect(openOther).not.toHaveBeenCalled();
  });
});

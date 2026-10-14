import { afterEach, describe, expect, it, vi } from "vitest";
import { foundryCharacterCreateEnvironment } from "./character-create";

const ID = "AbCdEfGhIjKlMnOp";
const GM = "gm";

describe("foundryCharacterCreateEnvironment", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("re-reads the world Actor after stale create, update and flag return values", async () => {
    const marker = { version: 1, requesterId: GM, operationId: ID };
    const getFlag = vi.fn((): unknown => null);
    const persisted: {
      id: string;
      name: string;
      type: string;
      ownership: Record<string, unknown>;
      flags: Record<string, unknown>;
      getFlag: typeof getFlag;
      update: ReturnType<typeof vi.fn>;
      setFlag: ReturnType<typeof vi.fn>;
    } = {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: 0, [GM]: 3 },
      flags: { "eagle-character-edit": { playerCreate: null } },
      getFlag,
      update: vi.fn(async (changes: Record<string, unknown>, operation?: Record<string, unknown>) => {
        const requested = changes.ownership as Record<string, unknown>;
        persisted.ownership = operation?.recursive === false ? requested : { ...persisted.ownership, ...requested };
        return undefined;
      }),
      setFlag: vi.fn(async (_scope: string, _key: string, value: unknown) => {
        persisted.flags = { "eagle-character-edit": { playerCreate: value } };
        persisted.getFlag.mockReturnValue(value);
        return undefined;
      }),
    };
    const stale = {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: 0, [GM]: 3 },
      flags: { "eagle-character-edit": { playerCreate: null } },
      getFlag: () => null,
      update: persisted.update,
      setFlag: persisted.setFlag,
    };
    const actors = new Map([[ID, persisted]]);
    vi.stubGlobal("CONST", { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, OWNER: 3 } });
    const createDocuments = vi.fn(async (data: Record<string, unknown>[]) => {
      data[0]!.ownership = { default: 0, [GM]: 3 };
      return [stale];
    });
    vi.stubGlobal("CONFIG", { Actor: { documentClass: { createDocuments } } });
    vi.stubGlobal("game", { actors, users: new Map([[GM, { isGM: true }]]) });

    const result = await foundryCharacterCreateEnvironment().create({
      id: ID,
      name: "New hero",
      requesterId: GM,
      ownership: "none",
      marker,
    });

    expect(result).toEqual({ id: ID, name: "New hero", type: "character", ownership: { default: 0 }, marker });
    expect(persisted.update).toHaveBeenCalledWith({ ownership: { default: 0 } }, { recursive: false });
    expect(persisted.setFlag).toHaveBeenCalledWith("eagle-character-edit", "playerCreate", marker);
  });

  it("refuses a changed create id before it writes repair data", async () => {
    const update = vi.fn();
    const setFlag = vi.fn();
    vi.stubGlobal("CONST", { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, OWNER: 3 } });
    vi.stubGlobal("CONFIG", {
      Actor: {
        documentClass: {
          createDocuments: vi.fn(async () => [{ id: "QrStUvWxYz012345", update, setFlag }]),
        },
      },
    });
    vi.stubGlobal("game", { actors: new Map(), users: new Map([[GM, { isGM: true }]]) });

    await expect(
      foundryCharacterCreateEnvironment().create({
        id: ID,
        name: "New hero",
        requesterId: GM,
        ownership: "none",
        marker: { version: 1, requesterId: GM, operationId: ID },
      }),
    ).rejects.toThrow("Foundry did not preserve the Actor id");
    expect(update).not.toHaveBeenCalled();
    expect(setFlag).not.toHaveBeenCalled();
  });

  it("requires the created Actor to be present in the canonical world collection", async () => {
    const update = vi.fn();
    const setFlag = vi.fn();
    vi.stubGlobal("CONST", { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, OWNER: 3 } });
    vi.stubGlobal("CONFIG", {
      Actor: {
        documentClass: {
          createDocuments: vi.fn(async () => [{ id: ID, update, setFlag }]),
        },
      },
    });
    vi.stubGlobal("game", { actors: new Map(), users: new Map([[GM, { isGM: true }]]) });

    await expect(
      foundryCharacterCreateEnvironment().create({
        id: ID,
        name: "New hero",
        requesterId: GM,
        ownership: "none",
        marker: { version: 1, requesterId: GM, operationId: ID },
      }),
    ).rejects.toThrow("Foundry did not persist the Actor");
    expect(update).not.toHaveBeenCalled();
    expect(setFlag).not.toHaveBeenCalled();
  });

  it("replaces legacy ownership before writing its marker", async () => {
    const marker = { version: 1, requesterId: GM, operationId: ID };
    let storedMarker: unknown = null;
    const actor = {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: 0, [GM]: 3 } as Record<string, unknown>,
      getFlag: vi.fn(() => storedMarker),
      update: vi.fn(async (changes: Record<string, unknown>, operation?: Record<string, unknown>) => {
        const requested = changes.ownership as Record<string, unknown>;
        actor.ownership = operation?.recursive === false ? requested : { ...actor.ownership, ...requested };
        return actor;
      }),
      setFlag: vi.fn(async (_scope: string, _key: string, value: unknown) => {
        storedMarker = value;
        return actor;
      }),
    };
    vi.stubGlobal("CONST", { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, OWNER: 3 } });
    vi.stubGlobal("CONFIG", { Actor: { documentClass: { createDocuments: vi.fn() } } });
    vi.stubGlobal("game", { actors: new Map([[ID, actor]]), users: new Map([[GM, { isGM: true }]]) });

    await expect(
      foundryCharacterCreateEnvironment().repairOwnership(
        { id: ID, name: "New hero", type: "character", ownership: { default: 0, [GM]: 3 }, marker: null },
        GM,
        "none",
      ),
    ).resolves.toEqual({ id: ID, name: "New hero", type: "character", ownership: { default: 0 }, marker });
    expect(actor.update).toHaveBeenCalledWith({ ownership: { default: 0 } }, { recursive: false });
    expect(actor.setFlag).toHaveBeenCalledWith("eagle-character-edit", "playerCreate", marker);
  });
});

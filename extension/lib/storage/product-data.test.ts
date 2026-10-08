import { describe, expect, it, beforeEach, vi } from "vitest";
import { saveProfile, getProfile, saveDocument } from "./profile-db";
import { createEmptyProfile } from "@/lib/profile/schema";
import { PRODUCT_STORAGE_KEYS } from "./product-keys";
import { deleteAllProductData } from "./product-data";

const storage: Record<string, unknown> = {};

vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: async (keys: string | string[]) => {
        const list = Array.isArray(keys) ? keys : [keys];
        const out: Record<string, unknown> = {};
        for (const k of list) {
          if (k in storage) out[k] = storage[k];
        }
        return out;
      },
      set: async (obj: Record<string, unknown>) => {
        Object.assign(storage, obj);
      },
      remove: async (keys: string[]) => {
        for (const k of keys) delete storage[k];
      },
    },
  },
});

describe("deleteAllProductData", () => {
  beforeEach(async () => {
    for (const k of Object.keys(storage)) delete storage[k];
    const p = createEmptyProfile();
    p.personalInfo.fullName = "Temp";
    await saveProfile(p);
    await saveDocument({
      id: "doc-1",
      kind: "pdf",
      name: "t.pdf",
      extractedText: "x",
      updatedAt: new Date().toISOString(),
    });
    for (const k of PRODUCT_STORAGE_KEYS) {
      storage[k] = "seed";
    }
  });

  it("remove perfil, documentos e chaves chrome.storage do produto", async () => {
    await deleteAllProductData();
    expect(await getProfile()).toBeNull();
    for (const k of PRODUCT_STORAGE_KEYS) {
      if (k === "executionState") {
        expect(storage[k]).toBe("IDLE");
      } else {
        expect(storage[k]).toBeUndefined();
      }
    }
  });
});

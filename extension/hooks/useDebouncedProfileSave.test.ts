import { describe, expect, it, vi, beforeEach } from "vitest";
import { createEmptyProfile } from "@/lib/profile/schema";
import { persistProfile } from "./useDebouncedProfileSave";

vi.mock("@/lib/storage/profile-db", () => ({
  saveProfile: vi.fn(async () => undefined),
}));

import { saveProfile } from "@/lib/storage/profile-db";

describe("persistProfile (autosave gate)", () => {
  beforeEach(() => {
    vi.mocked(saveProfile).mockClear();
  });

  it("não chama saveProfile quando Zod falha", async () => {
    const bad = createEmptyProfile();
    bad.experiences = [
      { company: "X", startDate: "2022-01", endDate: "2020-01" },
    ];
    const result = await persistProfile(bad);
    expect(result.ok).toBe(false);
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("salva perfil válido", async () => {
    const ok = createEmptyProfile();
    ok.personalInfo.fullName = "Ana";
    const result = await persistProfile(ok);
    expect(result.ok).toBe(true);
    expect(saveProfile).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, beforeEach } from "vitest";
import { createEmptyProfile } from "@/lib/profile/schema";
import {
  deleteAllIndexedDb,
  getProfile,
  PROFILE_ID,
  saveProfile,
} from "./profile-db";

describe("profile-db", () => {
  beforeEach(async () => {
    await deleteAllIndexedDb();
  });

  it("round-trip perfil mínimo com id default", async () => {
    const profile = createEmptyProfile(PROFILE_ID);
    profile.personalInfo = { fullName: "Ana Teste" };
    profile.updatedAt = new Date().toISOString();
    await saveProfile(profile);
    const loaded = await getProfile();
    expect(loaded?.personalInfo.fullName).toBe("Ana Teste");
    expect(loaded?.id).toBe(PROFILE_ID);
  });
});

import { describe, expect, it, afterEach } from "vitest";
import {
  __setResumeParserForTests,
  structureResumeText,
} from "./structure-resume-text";
import { createEmptyProfile } from "./schema";

describe("structureResumeText", () => {
  afterEach(() => {
    __setResumeParserForTests(null);
  });

  it("não inventa mais experiências que o parser retorna (máx. 2)", async () => {
    __setResumeParserForTests(async () => {
      const p = createEmptyProfile();
      p.experiences = [
        { company: "A Corp", title: "Dev" },
        { company: "B Corp", title: "Dev" },
      ];
      return p;
    });

    const result = await structureResumeText("texto qualquer");
    expect(result.experiences.length).toBeLessThanOrEqual(2);
    expect(result.experiences[0]?.company).toBe("A Corp");
    expect(result.fieldMeta?.["experiences.0.company"]?.verified).toBe(false);
  });
});

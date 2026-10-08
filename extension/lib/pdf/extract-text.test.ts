import { describe, expect, it, vi, beforeEach } from "vitest";
import { extractPdfText } from "./extract-text";

vi.mock("./setup-worker", () => ({
  ensurePdfWorker: vi.fn(),
  pdfjs: {
    getDocument: vi.fn(),
  },
}));

import { pdfjs } from "./setup-worker";

describe("extractPdfText", () => {
  beforeEach(() => {
    vi.mocked(pdfjs.getDocument).mockReset();
  });

  it("concatena texto das páginas", async () => {
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({
            items: [{ str: "Joao" }, { str: "Dev" }],
          }),
        }),
        cleanup: async () => {},
      }),
    } as ReturnType<typeof pdfjs.getDocument>);

    const text = await extractPdfText(new ArrayBuffer(8));
    expect(text).toContain("Joao");
    expect(text).toContain("Dev");
  });

  it("retorna string vazia quando PDF não tem texto", async () => {
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({ items: [] }),
        }),
        cleanup: async () => {},
      }),
    } as ReturnType<typeof pdfjs.getDocument>);

    const text = await extractPdfText(new ArrayBuffer(8));
    expect(text).toBe("");
  });
});

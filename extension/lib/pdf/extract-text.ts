import { ensurePdfWorker, pdfjs } from "./setup-worker";

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  ensurePdfWorker();
  // PDF.js may transfer/detach the buffer; never reuse the same ArrayBuffer for IDB.
  const pdfData = data.slice(0);
  const loadingTask = pdfjs.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  try {
    const chunks: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      chunks.push(pageText);
    }
    return chunks.join("\n").trim();
  } finally {
    // PDFDocumentProxy uses cleanup(); destroy() is on PDFDocumentLoadingTask.
    if (typeof pdf.cleanup === "function") {
      await pdf.cleanup();
    }
  }
}

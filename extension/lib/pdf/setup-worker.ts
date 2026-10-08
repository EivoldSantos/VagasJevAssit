import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;

export function ensurePdfWorker(): void {
  if (configured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  configured = true;
}

export { pdfjs };

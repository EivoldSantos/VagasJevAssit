import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "manifest.json"), "utf8"),
);

const forbidden = [
  "debugger",
  "chrome.debugger",
  "devtools",
  "playwright",
  "puppeteer",
  "cdp",
];

const text = JSON.stringify(manifest).toLowerCase();
for (const term of forbidden) {
  if (text.includes(term)) {
    console.error(`manifest contém termo proibido: ${term}`);
    process.exit(1);
  }
}

if (manifest.manifest_version !== 3) {
  console.error("manifest_version deve ser 3");
  process.exit(1);
}

const perms = new Set([
  ...(manifest.permissions ?? []),
  ...(manifest.optional_permissions ?? []),
]);

if (!perms.has("activeTab") || !perms.has("scripting")) {
  console.error("permissions exigem activeTab e scripting");
  process.exit(1);
}

if (manifest.content_scripts?.length) {
  console.error("content_scripts globais não permitidos no tracer");
  process.exit(1);
}

console.log("verify-manifest: OK");

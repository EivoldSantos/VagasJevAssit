import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, ".output", "chrome-mv3", "manifest.json");

if (!existsSync(manifestPath)) {
  console.error("Execute npm run build antes de verify-manifest");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

if (manifest.manifest_version !== 3) {
  console.error("manifest_version deve ser 3");
  process.exit(1);
}

const perms = new Set(manifest.permissions ?? []);
for (const p of ["activeTab", "scripting", "sidePanel", "storage", "tabs"]) {
  if (!perms.has(p)) {
    console.error(`permission ausente: ${p}`);
    process.exit(1);
  }
}

const hosts = manifest.host_permissions ?? [];
if (hosts.includes("<all_urls>") || hosts.includes("*://*/*")) {
  console.error("host_permissions não pode incluir <all_urls>");
  process.exit(1);
}
for (const entry of hosts) {
  if (!/^https?:\/\/(127\.0\.0\.1|localhost):5173\//.test(entry)) {
    console.warn(`host_permission fora do lab (revisar): ${entry}`);
  }
}

const cs = manifest.content_scripts ?? [];
for (const entry of cs) {
  const matches = entry.matches ?? [];
  if (matches.some((m) => m === "<all_urls>" || m === "*://*/*")) {
    console.error("content_scripts com match amplo proibido");
    process.exit(1);
  }
}

if (!manifest.side_panel?.default_path) {
  console.error("side_panel.default_path ausente");
  process.exit(1);
}

console.log("verify-manifest: OK");

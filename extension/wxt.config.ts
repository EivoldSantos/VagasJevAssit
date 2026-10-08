import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "VagasJevAssist",
    description: "Autopreenchimento de candidaturas — Side Panel",
    permissions: ["activeTab", "scripting", "sidePanel", "storage", "tabs"],
    host_permissions: [
      "http://127.0.0.1:5173/*",
      "http://localhost:5173/*",
    ],
    side_panel: {
      default_path: "sidepanel.html",
    },
  },
});

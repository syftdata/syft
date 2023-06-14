import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(async (env) => ({
  name: env.mode === "production" ? "Syft Tagger" : "[Dev] Syft Tagger",
  description:
    "Record browser interactions to auto generate event tests, and auto-magically instrument application code.",
  version: "0.0.0.3",
  manifest_version: 3,
  permissions: [
    "activeTab",
    "scripting",
    "storage",
    "contextMenus",
    "webNavigation",
    "debugger",
  ],
  host_permissions: ["<all_urls>"],
  icons: {
    "32": "img/logo-32.png",
    "48": "img/logo-48.png",
    "128": "img/logo-128.png",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  devtools_page: "devtools.html",
  action: {
    default_popup: "popup.html",
    default_icon: {
      "32": "img/logo-32.png",
      "48": "img/logo-48.png",
      "128": "img/logo-128.png",
    },
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_start",
    },
  ],
}));

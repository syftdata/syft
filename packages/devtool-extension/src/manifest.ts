import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  name: "Syft Studio",
  description:
    "Syft Studio lets you record, test and instrument your web apps.",
  version: "0.0.6",
  manifest_version: 3,
  permissions: [
    "activeTab",
    "scripting",
    "storage",
    "contextMenus",
    "webNavigation",
    "debugger",
    "tabs",
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
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_start",
    },
    {
      matches: ["<all_urls>"],
      js: ["src/content/devtools_source.ts"],
    },
  ],
});

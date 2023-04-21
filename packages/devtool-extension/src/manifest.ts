import { defineManifest, defineDynamicResource } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'Syft Studio',
  description: 'Syft Studio lets you record, test and instrument your web apps.',
  version: '0.0.2',
  manifest_version: 3,

  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-32.png',
  },
  permissions: ['activeTab', 'scripting', 'storage', 'contextMenus', 'webNavigation'],
  host_permissions: ['<all_urls>'],

  // our site can talk to the extension.
  externally_connectable: {
    matches: ['https://*.syftdata.com/*'],
  },

  icons: {
    '32': 'img/logo-32.png',
    '48': 'img/logo-48.png',
    '128': 'img/logo-128.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  devtools_page: 'devtools.html',

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
    },
    {
      matches: ['https://*.syftdata.com/*'],
      js: ['src/content/bridge.ts'],
    },
    {
      matches: ['http://localhost/*'],
      js: ['src/content/bridge.ts'],
    },
  ],
  web_accessible_resources: [
    defineDynamicResource({
      matches: ['<all_urls>'],
    }),
  ],
})

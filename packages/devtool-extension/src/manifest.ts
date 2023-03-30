import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'Syft Dev Extension',
  description: 'A Developer Extension to view Syft and DOM events.',
  version: '0.0.1',
  manifest_version: 3,
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
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/*.png', 'scripts/*.js'],
      matches: [],
    },
  ],
  permissions: ['activeTab', 'storage'],
})

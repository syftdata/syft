/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUD_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  readonly VITE_LOCIZE_PROJECT_ID?: string
}

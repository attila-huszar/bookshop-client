/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  readonly VITE_LOGTAIL_SOURCE_TOKEN: string
  readonly VITE_LOGTAIL_INGESTING_HOST: string
}

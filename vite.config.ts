import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        [env.VITE_ELASTIC_PATH]: {
          target: env.VITE_ELASTIC_URL,
          headers: {
            Authorization: `ApiKey ${env.VITE_ELASTIC_API_KEY}`,
          },
          rewrite: (path) => path.replace(env.VITE_ELASTIC_PATH, ''),
          secure: false,
        },
        [env.VITE_JSON_SERVER_PATH]: {
          target: env.VITE_JSON_SERVER_URL,
          rewrite: (path) => path.replace(env.VITE_JSON_SERVER_PATH, ''),
          secure: false,
        },
      },
    },
  }
})

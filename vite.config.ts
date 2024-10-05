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
    test: {
      restoreMocks: true,
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.{js,ts,jsx,tsx}'],
      exclude: ['node_modules', 'dist'],
      setupFiles: './src/setupTests.tsx',
      reporters: 'dot',
      coverage: {
        provider: 'istanbul',
        reportsDirectory: 'coverage',
        reporter: ['html', 'text-summary'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'node_modules',
          'dist',
          'src/main.tsx',
          'src/setupTests.ts',
          'src/**/*.test.{ts,tsx}',
          'src/**/*.styles.{ts,tsx}',
          'src/constants',
        ],
      },
      threads: true,
      isolate: true,
      silent: false,
      watch: true,
    },
  }
})

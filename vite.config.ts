import { defineConfig, loadEnv } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

const ReactCompilerConfig = {}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
        },
      }),
      svgr(),
      visualizer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: isDevelopment
        ? {
            '/api': {
              target: env.VITE_SERVER_URL,
              rewrite: (path) => path.replace(/^\/api/, ''),
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
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

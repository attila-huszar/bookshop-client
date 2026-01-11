import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

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
      env: {
        VITE_BASE_URL: 'http://localhost:5173',
        VITE_SERVER_URL: 'http://localhost:5000',
        VITE_STRIPE_PUBLIC_KEY: 'pk_test_mock_stripe_key',
      },
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

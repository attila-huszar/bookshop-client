import { defineConfig, loadEnv } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd())

  return {
    plugins: [react(), svgr(), visualizer()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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

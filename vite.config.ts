import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv, searchForWorkspaceRoot, withFilter } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      withFilter(svgr(), { load: { id: /\.svg\?react$/ } }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'lottie-react': 'lottie-react/build/index.es.js',
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
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },
    build: {
      rollupOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
                priority: 100,
              },
              {
                name: 'router-vendor',
                test: /node_modules[\\/]react-router[\\/]/,
                priority: 90,
              },
              {
                name: 'redux-vendor',
                test: /node_modules[\\/](?:@reduxjs|react-redux|redux)[\\/]/,
                priority: 80,
              },
              {
                name: 'form-vendor',
                test: /node_modules[\\/](?:formik|yup)[\\/]/,
                priority: 70,
              },
              {
                name: 'stripe-vendor',
                test: /node_modules[\\/](?:@stripe|stripe)[\\/]/,
                priority: 60,
              },
              {
                name: 'swiper-vendor',
                test: /node_modules[\\/]swiper[\\/]/,
                priority: 50,
              },
              {
                name: 'lottie-vendor',
                test: /node_modules[\\/](?:lottie-react|lottie-web)[\\/]/,
                priority: 40,
              },
              {
                name: 'styled-vendor',
                test: /node_modules[\\/]styled-components[\\/]/,
                priority: 30,
              },
              {
                name: 'vendor',
                test: /node_modules[\\/]/,
                priority: 0,
              },
            ],
          },
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

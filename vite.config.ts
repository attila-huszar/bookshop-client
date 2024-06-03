import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      api: '/src/api',
      assets: '/src/assets',
      components: '/src/components',
      helpers: '/src/helpers',
      hooks: '/src/hooks',
      interfaces: '/src/interfaces',
      lib: '/src/lib',
      pages: '/src/pages',
      routes: '/src/routes',
      store: '/src/store',
      styles: '/src/styles',
    },
  },
})

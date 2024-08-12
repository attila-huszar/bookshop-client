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
      constants: '/src/constants',
      helpers: '/src/helpers',
      hooks: '/src/hooks',
      interfaces: '/src/interfaces',
      pages: '/src/pages',
      routes: '/src/routes',
      services: '/src/services',
      store: '/src/store',
      styles: '/src/styles',
    },
  },
})

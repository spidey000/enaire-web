import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Base path for deployment (root of domain)
  assetsInclude: ['**/*.md', '**/*.json'],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Copy data files to dist
  publicDir: 'src/data'
})

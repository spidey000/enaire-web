import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.md', '**/*.json'],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

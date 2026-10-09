import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@emotion/react': path.resolve(frontendRoot, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(frontendRoot, 'node_modules/@emotion/styled'),
    },
  },
})

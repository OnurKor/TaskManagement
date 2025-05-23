import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 850, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) {
            return 'vendor_react';
          }
          if (id.includes('node_modules/lodash')) {
            return 'vendor_lodash';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor_axios';
          }
        }
      }
    }
  }
})

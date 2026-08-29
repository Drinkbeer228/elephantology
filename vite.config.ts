import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL || '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark-') ||
            id.includes('node_modules/rehype-')
          ) {
            return 'markdown';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
        }
      }
    }
  }
});


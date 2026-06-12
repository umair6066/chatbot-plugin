import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

// Standalone embeddable widget build — single IIFE JS file, CSS injected at runtime.
// Drop it on any page and call ChatbotWidget.init({...}).
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist-widget',
    lib: {
      entry: resolve(__dirname, 'src/plugin-entry.ts'),
      name: 'ChatbotWidget',
      fileName: 'chatbot-widget',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
    },
    cssCodeSplit: false,
  },
});

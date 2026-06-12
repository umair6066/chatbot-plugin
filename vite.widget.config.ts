import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Standalone embeddable widget build — outputs a single IIFE JS file
// with CSS inlined. Drop it on any page and call ChatbotWidget.init({...}).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-widget',
    lib: {
      entry: resolve(__dirname, 'src/plugin-entry.ts'),
      name: 'ChatbotWidget',
      fileName: 'chatbot-widget',
      formats: ['iife'],
    },
    rollupOptions: {
      // Bundle React into the output so the host page doesn't need it
      external: [],
    },
    cssCodeSplit: false,
  },
});

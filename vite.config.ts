import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        },
        {
          src: 'public/images/*',
          dest: 'images/',
        },
        {
          src: 'keywords/keywords.txt',
          dest: '.',
        },
        {
          src: 'src/styles/content.css',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: './popup.html',
        content: './src/content/content.ts',
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'content') return 'content.js';
          if (chunk.name === 'popup') return 'assets/popup-[hash].js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

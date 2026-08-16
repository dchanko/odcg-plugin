import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/embed.js',
      name: 'OdcgCalculator',
      formats: ['iife'],
      fileName: () => 'odcg.min.js',
    },
    outDir: 'dist',
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,
      },
    },
  },
});

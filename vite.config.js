import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
  },
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

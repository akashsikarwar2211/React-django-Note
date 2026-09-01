import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './TEST-results.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'xml']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

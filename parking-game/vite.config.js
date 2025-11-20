import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };

  // Only use base path in production build
  if (command === 'build') {
    config.base = '/drive-car/';
  }

  return config;
})


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Base public path when served in production.
  // Set to './' for relative paths if hosting in a subfolder or for robustness on Vercel.
  base: './',
  build: {
    // Output directory for build assets
    outDir: 'dist',
    // Empty the output directory before building
    emptyOutDir: true,
  },
});

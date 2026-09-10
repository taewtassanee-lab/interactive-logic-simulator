import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' ทำให้ build ไปวางที่ subfolder ใดก็ได้ (GitHub Pages / Netlify / โฟลเดอร์ในโรงเรียน)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});

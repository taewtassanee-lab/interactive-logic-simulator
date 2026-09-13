import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' ทำให้ build ไปวางที่ subfolder ใดก็ได้ (GitHub Pages / Netlify / โฟลเดอร์ในโรงเรียน)
/** เวลาที่ build ใช้แสดงเป็นป้ายรุ่นท้ายเว็บ ช่วยตรวจว่าเครื่องไหนยังค้างไฟล์รุ่นเก่าในแคช */
const buildId = new Date()
  .toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' })
  .slice(0, 16);

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});

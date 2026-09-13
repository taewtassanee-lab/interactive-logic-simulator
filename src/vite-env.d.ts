/// <reference types="vite/client" />

/** เวลาที่ build ไฟล์ชุดนี้ ตั้งค่าไว้ใน vite.config.ts */
declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly VITE_COURSE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

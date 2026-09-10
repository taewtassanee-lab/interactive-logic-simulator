/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLASSROOM_URL?: string;
  readonly VITE_COURSE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

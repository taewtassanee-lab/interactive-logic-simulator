/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COURSE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

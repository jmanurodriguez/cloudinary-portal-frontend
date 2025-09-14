/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_NODE_ENV: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
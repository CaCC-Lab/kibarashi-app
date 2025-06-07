/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_OFFLINE: string;
  readonly VITE_ENABLE_VOICE_GUIDE: string;
  readonly VITE_DEFAULT_VOICE_SPEED: string;
  readonly VITE_DEFAULT_VOICE_PITCH: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
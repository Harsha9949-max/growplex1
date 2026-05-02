/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_MARKUP_PERCENT: string;
  readonly VITE_ADMIN_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

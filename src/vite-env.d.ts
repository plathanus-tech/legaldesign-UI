/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  /** Só no app "sistema": endereço do Storybook que renderiza as telas. */
  readonly VITE_STORYBOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

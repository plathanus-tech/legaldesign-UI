import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/tokens.css';
import '../tokens/overrides.css';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { PrototypeNav } from '../prototype/PrototypeNav';

/** O "sistema": o Navegador de Protótipo em tela cheia, sem a interface do Storybook. As telas abrem a partir do Storybook publicado em /storybook. */
document.documentElement.setAttribute('data-theme', 'light');
document.body.setAttribute('data-theme', 'light');

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <PrototypeNav />
  </StrictMode>,
);

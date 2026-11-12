import type { Meta, StoryObj } from '@storybook/react';
import { PrototypeNav } from './PrototypeNav';

const meta: Meta<typeof PrototypeNav> = {
  title: 'Protótipo/Navegador de Protótipo',
  component: PrototypeNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Ferramenta de apoio (fora da interface final): árvore de telas e variantes, alternância Desktop/Tablet/Mobile e a tela aberta num quadro. Registre telas novas em src/prototype/config.ts.',
      },
    },
  },
};
export default meta;

export const Navegador: StoryObj<typeof PrototypeNav> = {};

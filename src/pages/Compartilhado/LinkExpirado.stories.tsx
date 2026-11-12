import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { limparRespostas } from '../fluxo/respostas';
import { LinkExpirado } from './LinkExpirado';

const meta: Meta<typeof LinkExpirado> = {
  title: 'Telas/C - Link expirado',
  component: LinkExpirado,
  args: { onNovoContrato: () => { limparRespostas(); irPara(TELAS.tipoDeLocacao); } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Link expirado (ou que não existe mais). Explica o que aconteceu e o que fazer: pedir um novo link a quem enviou ou começar outro contrato. Não mostra dados do contrato.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LinkExpirado>;

export const Padrao: Story = { name: 'Padrão' };

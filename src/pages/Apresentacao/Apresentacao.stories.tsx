import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { limparRespostas } from '../fluxo/respostas';
import { ApresentacaoV3 } from './ApresentacaoV3';

const meta: Meta<typeof ApresentacaoV3> = {
  title: 'Telas/0 - Apresentação',
  component: ApresentacaoV3,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tela 0 do fluxo de contrato de locação: apresentação da proposta e modelos disponíveis (catálogo com 1 item); o botão do modelo vai direto ao formulário. Introdução compacta com o texto e os três fatos à esquerda, a ilustração do documento à direita (com um brilho verde suave) e o modelo logo abaixo. Sem login. Marca provisória (Base). Textos entre colchetes dependem do cliente. Para ver em desktop, tablet e mobile use o Navegador de Protótipo.',
      },
    },
  },
  args: { inAppBrowser: false, onStart: () => { limparRespostas(); irPara(TELAS.tipoDeLocacao); } },
};
export default meta;
type Story = StoryObj<typeof ApresentacaoV3>;

export const Padrao: Story = { name: 'Padrão' };

export const ComAtualizacaoJuridica: Story = {
  name: 'Com atualização jurídica informada',
  args: { atualizacao: 'Considera a decisão mais recente do STJ sobre [tema], publicada em [data].' },
};

export const NavegadorInternoDoInstagram: Story = {
  name: 'Navegador interno do Instagram',
  args: { inAppBrowser: true },
};

export const SemDataDeAtualizacao: Story = {
  name: 'Sem data de atualização',
  args: { atualizadoEm: null },
};

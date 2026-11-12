import type { Meta, StoryObj } from '@storybook/react';
import { Tab } from './Tab';

const tabs = [
  { label: 'Visão geral', content: <p>Conteúdo da aba Visão geral. Aqui ficam as informações gerais do produto.</p> },
  { label: 'Especificações', content: <p>Conteúdo das Especificações técnicas detalhadas do produto.</p> },
  { label: 'Avaliações', content: <p>Conteúdo das Avaliações de clientes sobre este produto.</p> },
];

const meta: Meta<typeof Tab> = { title: 'Components/Tab', component: Tab, tags: ['autodocs'],
  decorators: [(S) => <div style={{ width: 480 }}><S /></div>] };
export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = { args: { tabs } };
export const SecondTabActive: Story = { args: { tabs, defaultIndex: 1 } };
export const ManyTabs: Story = {
  args: {
    tabs: [
      { label: 'Início', content: <p>Início</p> },
      { label: 'Produtos', content: <p>Produtos</p> },
      { label: 'Serviços', content: <p>Serviços</p> },
      { label: 'Sobre', content: <p>Sobre nós</p> },
      { label: 'Contato', content: <p>Contato</p> },
    ],
  },
};

/**
 * Lista estreita com muitas abas: a faixa rola na horizontal (sem barra visível) e a aba selecionada
 * por clique ou setas é trazida para dentro da área visível, sem mover a página.
 */
export const RolagemEmTelaEstreita: Story = {
  name: 'Rolagem em tela estreita',
  decorators: [(S) => <div style={{ width: 280 }}><S /></div>],
  args: {
    'aria-label': 'Seções da conta',
    tabs: [
      { label: 'Perfil', content: <p>Dados do perfil.</p> },
      { label: 'Segurança', content: <p>Senha e verificação em duas etapas.</p> },
      { label: 'Notificações', content: <p>Preferências de notificação.</p> },
      { label: 'Privacidade', content: <p>Visibilidade do perfil e consentimentos.</p> },
      { label: 'Faturamento', content: <p>Plano e forma de pagamento.</p> },
      { label: 'Integrações', content: <p>Aplicativos conectados.</p> },
    ],
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { EstiloELogo } from './EstiloELogo';

const meta: Meta<typeof EstiloELogo> = {
  title: 'Telas/3.1 - Estilo, logo e aceites',
  component: EstiloELogo,
  args: {
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.pagamento),
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Estilo do contrato (o layout do PDF), com um desenho de cada um e uma janela "Ver prévia" com parte do documento, o texto das cláusulas borrado e o valor de cada estilo; logo opcional (só no PDF, não é guardado); indicação opcional do corretor ou imobiliária. Antes de pagar: a orientação de que o PDF não muda depois do pagamento é um texto simples, junto da confirmação explícita (checkbox); os Termos de uso e a Política de Privacidade têm um único aceite (checkbox), separado, perto do fim da tela, e cada um abre em uma janela com texto provisório (o cliente vai enviar o conteúdo exato). Os três estilos e os valores são marcadores.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof EstiloELogo>;

export const Padrao: Story = { name: 'Padrão' };
export const Preenchida: Story = { name: 'Tudo escolhido e aceito', args: { inicial: { estilo: 'moderno', corretor: 'Imobiliária Exemplo Ltda.', aceites: true } } };
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { estilo: 'classico' } } };

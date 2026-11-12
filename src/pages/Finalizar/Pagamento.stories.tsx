import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { Pagamento } from './Pagamento';

const meta: Meta<typeof Pagamento> = {
  title: 'Telas/4.1 - Pagamento',
  component: Pagamento,
  args: {
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.estilo),
    onPago: () => irPara(TELAS.sucesso),
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pagamento. Depois de escolher o estilo, a janela do gateway abre embutida sobre esta tela. É lá que a pessoa escolhe Pix, crédito ou débito e informa os dados que o gateway pedir (inclusive CPF, se ele exigir), e onde acontecem recusas, Pix expirado e novas tentativas. Aprovado, a janela fecha e a pessoa volta ao fluxo (5.1). Se fechar a janela, a tela continua com o pedido e o botão para abrir de novo. A janela é uma simulação: o visual real é do gateway. O valor (R$ 00,00 é um marcador) e os dados pedidos ainda precisam ser confirmados com o cliente.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Pagamento>;

export const Padrao: Story = { name: 'Padrão (janela do gateway abre)' };
export const Recusado: Story = { name: 'Dentro do gateway: pagamento recusado', args: { estado: 'recusado' } };
export const PixExpirado: Story = { name: 'Dentro do gateway: Pix expirado', args: { estado: 'pix-expirado' } };
export const JanelaFechada: Story = { name: 'Fechou a janela sem pagar', args: { fechou: true } };

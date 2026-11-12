import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { limparRespostas } from '../fluxo/respostas';
import { RESPOSTAS_COMPLETAS } from '../Revisar/exemplos';
import { ResumoCompartilhado } from './ResumoCompartilhado';

const meta: Meta<typeof ResumoCompartilhado> = {
  title: 'Telas/A - Resumo compartilhado',
  component: ResumoCompartilhado,
  args: {
    respostas: RESPOSTAS_COMPLETAS,
    onNovoContrato: () => { limparRespostas(); irPara(TELAS.tipoDeLocacao); },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'O que a pessoa vê ao abrir o link do resumo (por exemplo, o proprietário recebendo do corretor). As mesmas frases da revisão, só para conferir: o que quem enviou preencheu e o que o sistema sugere, sem cláusulas. Quem recebe não edita. Mostra até que dia o link funciona (a data real de expiração). Quem recebe pode marcar informações específicas (modo de seleção, só leitura) e compartilhar comentários por WhatsApp ou e-mail, ou compartilhar o resumo todo. Sem login.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ResumoCompartilhado>;

export const SoConferir: Story = { name: 'Padrão (só conferir)' };
export const Selecionando: Story = { name: 'Selecionando informações', args: { selecionando: true } };
export const PoucosDias: Story = { name: 'Poucos dias restantes', args: { diasRestantes: 2 } };

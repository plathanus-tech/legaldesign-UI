import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irEditarDoResumo, TELAS } from '../../prototype/navegar';
import { RESPOSTAS_COMPLETAS } from '../Revisar/exemplos';
import { RetomarResumo } from './RetomarResumo';

const meta: Meta<typeof RetomarResumo> = {
  title: 'Telas/B - Retomar resumo',
  component: RetomarResumo,
  args: {
    respostas: RESPOSTAS_COMPLETAS,
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.saida),
    onIrParaSecao: irEditarDoResumo,
    onSeguinte: () => irPara(TELAS.estilo),
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'O link da própria pessoa para voltar e editar: abre direto na tela de revisão, com tudo preenchido, podendo editar, personalizar, compartilhar e seguir. Não há versão com informações faltando, porque o resumo só é compartilhado depois de passar por todas as perguntas. Mostra por quantos dias o resumo ainda fica guardado (com 2 dias ou menos, vira um aviso, e há uma variante para o último dia): são 15 dias depois do primeiro envio, então o número só diminui, e o link que ela compartilhar vale só pelo tempo que resta.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof RetomarResumo>;

export const Padrao: Story = { name: 'Padrão (12 dias restantes)' };
export const PoucosDias: Story = { name: 'Faltando 2 dias (warning)', args: { diasRestantes: 2 } };
export const UltimoDia: Story = { name: 'Último dia (warning)', args: { diasRestantes: 0 } };

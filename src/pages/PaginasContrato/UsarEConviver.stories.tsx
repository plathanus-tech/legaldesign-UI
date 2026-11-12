import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { PaginaPerguntas } from '../fluxo/PaginaPerguntas';
import { CONVIVENCIA_EXEMPLO } from './exemplos';

const meta: Meta<typeof PaginaPerguntas> = {
  title: 'Telas/1.7 - Usar e conviver',
  component: PaginaPerguntas,
  args: {
    pagina: 'convivencia',
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.valores),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.reparos),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Regras do dia a dia (sublocar ou emprestar, vistoria de entrada e prazo para questionar) e contas do imóvel (quais quem está alugando paga e quais ele só devolve ao proprietário). Visitas, danos, convivência e outros assuntos não viram pergunta: seguem as cláusulas padrão e podem ser personalizados na revisão.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPerguntas>;

export const Padrao: Story = { name: 'Padrão' };
export const Preenchida: Story = { name: 'Preenchida', args: { inicial: CONVIVENCIA_EXEMPLO } };
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { 'co-sublocar': 'nao' } } };

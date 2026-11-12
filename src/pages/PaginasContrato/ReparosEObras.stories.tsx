import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { PaginaPerguntas } from '../fluxo/PaginaPerguntas';
import { REPAROS_EXEMPLO } from './exemplos';

const meta: Meta<typeof PaginaPerguntas> = {
  title: 'Telas/1.8 - Reparos, obras e benfeitorias',
  component: PaginaPerguntas,
  args: {
    pagina: 'reparos',
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.convivencia),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.saida),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Mudanças e melhorias feitas por quem está alugando. Começa explicando em palavras simples o que são mudanças e melhorias (no contrato, “benfeitorias”), com exemplos. Pergunta se quem está alugando pode fazer mudanças e, se puder, o que acontece com as mudanças na saída (ficam, quem está alugando retira ou o proprietário paga, que é a parte indenizável) e três perguntas de sim ou não: se o proprietário devolve, ao final da locação, o valor das melhorias que evitam estragos, das que facilitam o uso e das de capricho ou conforto (as benfeitorias necessárias, úteis e voluptuárias do contrato, descritas em palavras simples e com exemplo). Os exemplos e as frases precisam de validação jurídica. Os reparos (do dia a dia, urgentes e de emergência) saíram das perguntas: já vêm nas cláusulas padrão e podem ser personalizados na revisão. Os textos precisam de validação jurídica.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPerguntas>;

export const Padrao: Story = { name: 'Padrão' };
export const Preenchida: Story = { name: 'Preenchida (mudanças com autorização)', args: { inicial: REPAROS_EXEMPLO } };
export const SemObras: Story = { name: 'Mudanças não permitidas', args: { inicial: { ...REPAROS_EXEMPLO, 're-obras': 'nao' } } };
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { 're-obras': 'pequenas' } } };

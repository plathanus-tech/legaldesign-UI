import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { PaginaPerguntas } from '../fluxo/PaginaPerguntas';
import { PESSOA } from '../PessoasEnvolvidas/exemplos';
import { SAIDA_EXEMPLO } from './exemplos';

const meta: Meta<typeof PaginaPerguntas> = {
  title: 'Telas/1.9 - Saída, garantias e penalidades',
  component: PaginaPerguntas,
  args: {
    pagina: 'saida',
    textoSeguinte: 'Revisar o contrato',
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.reparos),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.resumo),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Garantia do aluguel (fiador, depósito, seguro-fiança, fundo de investimento ou nenhuma), multa por saída antes do prazo (com o valor em número de aluguéis, unidade ainda a confirmar com o cliente, e a isenção depois de um período mínimo: 12º mês, 24º mês ou outro), aviso para sair e vistoria de saída (só sim ou não). Depois desta página, a pessoa revisa tudo no resumo do contrato. Com fiador, os dados dele (nome, CPF, estado civil, endereço etc.) são pedidos na própria página. Quais dados o cliente quer do fiador e as garantias e penalidades precisam de validação.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPerguntas>;

export const Padrao: Story = { name: 'Padrão' };
export const ComCaucao: Story = { name: 'Depósito (caução)', args: { inicial: SAIDA_EXEMPLO } };
export const ComFiador: Story = { name: 'Fiador', args: { inicial: { ...SAIDA_EXEMPLO, 'sa-garantia': 'fiador', 'sa-fiador': JSON.stringify({ ...PESSOA, nome: 'Carlos Pereira Lima', documento: '390.533.447-05' }) } } };
/** Contrato de 30 meses, mas a isenção da multa começa no 36º mês: o campo avisa que o mês passa da duração do contrato. */
export const MesDaIsencaoMaiorQueOContrato: Story = {
  name: 'Isenção a partir de um mês maior que o contrato',
  args: { mostrarErros: true, inicial: { ...SAIDA_EXEMPLO, 'va-prazo': '30', 'sa-desoneracao': 'outro', 'sa-desoneracao-mes': '36', 'sa-desoneracao-aviso': '30' } },
};
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { 'sa-garantia': 'fiador' } } };

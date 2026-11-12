import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irEditarDoResumo, TELAS } from '../../prototype/navegar';
import { RESPOSTAS_COMPLETAS, RESPOSTAS_CONDOMINIO_PENDENTE, RESPOSTAS_DUAS_PENDENCIAS, RESPOSTAS_PRAZO_LONGO, RESPOSTAS_SEM_CONDOMINIO } from './exemplos';
import { ResumoContrato } from './ResumoContrato';

const meta: Meta<typeof ResumoContrato> = {
  title: 'Telas/2.1 - Resumo do contrato',
  component: ResumoContrato,
  args: {
    respostas: RESPOSTAS_PRAZO_LONGO,
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
          'Revisão de tudo o que vai no contrato, em frases e agrupado por assunto: o que a pessoa respondeu e o que o sistema sugere (cláusulas padrão), sem o texto das cláusulas. Cada resposta tem "Editar", que leva direto à pergunta; cada ponto de cláusulas padrão tem "Personalizar". O resumo pode ser compartilhado para outra pessoa conferir.  A pessoa só chega aqui com os obrigatórios preenchidos, por isso a tela não tem estado de "faltam informações" nem aviso de sucesso.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ResumoContrato>;

export const Completo: Story = { name: 'Padrão (com cônjuge anuente)' };
export const Compartilhando: Story = { name: 'Compartilhar o resumo (modal)', args: { compartilharAberto: true } };
export const SemAnuente: Story = { name: 'Sem cônjuge anuente (prazo menor que 10 anos)', args: { respostas: RESPOSTAS_COMPLETAS } };
export const SemCondominio: Story = { name: 'Sem condomínio (casa fora de condomínio)', args: { respostas: RESPOSTAS_SEM_CONDOMINIO } };
export const AlteracaoSalva: Story = { name: 'Voltando de uma edição (alteração salva)', args: { editadoAgora: 'va-aluguel' } };
export const AlteracaoComPendencia: Story = { name: 'Voltando de uma edição que deixou algo pendente', args: { respostas: RESPOSTAS_CONDOMINIO_PENDENTE, editadoAgora: 'tipo-imovel' } };
export const AlteracaoComDuasPendencias: Story = { name: 'Voltando de uma edição com duas seções pendentes', args: { respostas: RESPOSTAS_DUAS_PENDENCIAS, editadoAgora: 'tipo-imovel' } };

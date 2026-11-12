import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { PaginaPerguntas } from '../fluxo/PaginaPerguntas';
import { PESSOA, PESSOA_2, PESSOA_COM_CONJUGE, UMA_PESSOA } from '../PessoasEnvolvidas/exemplos';
import { CONDOMINIO_EXEMPLO, VALORES_EXEMPLO } from './exemplos';

const meta: Meta<typeof PaginaPerguntas> = {
  title: 'Telas/1.6 - Valores e pagamento',
  component: PaginaPerguntas,
  args: {
    pagina: 'valores',
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.imovel),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.convivencia),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Aluguel (valor, início, duração, vencimento, forma de pagamento e reajuste; impostos e taxas não são perguntados aqui: já vêm como cláusula padrão na revisão), atraso (juros, multa e correção, com o valor digitado pela pessoa), impostos e taxas e, só se o imóvel for em condomínio, um bloco do condomínio (valor da taxa e atraso). As despesas ordinárias e extraordinárias, as multas e os serviços do condomínio não são perguntados aqui: já vêm como cláusulas padrão na revisão, onde a pessoa pode mudar. Segue o fluxo do cliente; opções e textos precisam de validação jurídica. Com prazo de 120 meses (10 anos) ou mais, cada pessoa casada(o) entre proprietários e quem está alugando precisa dos dados do cônjuge anuente: se já foram informados em Pessoas envolvidas, são reaproveitados; se não, a tela leva ao cadastro da pessoa e permite voltar ao prazo. A regra e os campos precisam de validação jurídica.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPerguntas>;

export const Padrao: Story = { name: 'Padrão' };
export const EmCondominio: Story = { name: 'Imóvel em condomínio (com perguntas do condomínio)', args: { imovel: 'apartamento-condominio', inicial: { ...VALORES_EXEMPLO, ...CONDOMINIO_EXEMPLO } } };
export const ForaDeCondominio: Story = { name: 'Imóvel fora de condomínio (sem perguntas do condomínio)', args: { imovel: 'casa-fora', inicial: VALORES_EXEMPLO } };
export const PrazoLongoPendente: Story = {
  name: 'Prazo de 10 anos: dados do cônjuge pendentes',
  args: { imovel: 'apartamento-condominio', inicial: { ...VALORES_EXEMPLO, ...CONDOMINIO_EXEMPLO, 'va-prazo': '120' }, pessoas: { locador: UMA_PESSOA, locatario: { principal: PESSOA_2, segundo: PESSOA, maisDeUm: false, compartilhado: null } } },
};
export const PrazoLongoCompleto: Story = {
  name: 'Prazo de 10 anos: cônjuge já informado (reaproveitado)',
  args: { imovel: 'apartamento-condominio', inicial: { ...VALORES_EXEMPLO, ...CONDOMINIO_EXEMPLO, 'va-prazo': '120' }, pessoas: { locador: { ...UMA_PESSOA, principal: PESSOA_COM_CONJUGE }, locatario: { principal: { ...PESSOA_2, estadoCivil: 'Solteiro(a)', regimeBens: '' }, segundo: PESSOA, maisDeUm: false, compartilhado: null } } },
};
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, imovel: 'apartamento-condominio', inicial: { 'va-aluguel': 'R$ 2.500,00', 'va-forma': 'pix' } } };

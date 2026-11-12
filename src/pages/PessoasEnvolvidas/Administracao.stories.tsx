import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { AdministracaoDoAluguel } from './AdministracaoDoAluguel';
import { CORRETOR_AUTONOMO, IMOBILIARIA } from './exemplos';

const meta: Meta<typeof AdministracaoDoAluguel> = {
  title: 'Telas/1.3 - Quem administra o aluguel',
  component: AdministracaoDoAluguel,
  args: {
    imovel: { uso: 'residencial', imovel: 'apartamento-condominio' },
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.dono),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.inquilino),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Quem vai administrar o aluguel: o próprio proprietário (primeira opção e já escolhida, porque ele já informou os dados) ou uma imobiliária ou corretor. Só com a imobiliária ou o corretor aparece o formulário, num cadastro único, sem escolher o tipo: nome, CPF ou CNPJ e CRECI (opcional), mais o endereço. Se o documento digitado for um CNPJ (imobiliária), aparecem o nome do representante legal e o CPF dele (opcional). Corretor autônomo preenche só o nome e o CPF (o CRECI é opcional). Os dados que o cliente quer da imobiliária/corretor, e se corretor autônomo (pessoa) é tratado diferente, ainda precisam de confirmação.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AdministracaoDoAluguel>;

export const Padrao: Story = { name: 'Padrão' };

export const ComImobiliaria: Story = { name: 'Imobiliária (CNPJ e representante legal)', args: { persistir: false, inicial: 'imobiliaria', inicialImobiliaria: IMOBILIARIA } };

export const CorretorAutonomo: Story = { name: 'Corretor autônomo (CPF)', args: { persistir: false, inicial: 'imobiliaria', inicialImobiliaria: CORRETOR_AUTONOMO } };

export const ProprioProprietario: Story = { name: 'O próprio proprietário', args: { persistir: false, inicial: 'proprio' } };

export const ComErros: Story = { name: 'Com informações faltando', args: { persistir: false, mostrarErros: true, inicial: 'imobiliaria', inicialImobiliaria: { nome: 'Imobiliária Exemplo Ltda.', documento: '45.723.174/0001-10' } } };

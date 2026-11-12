import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { LOCADOR_VAZIO } from '../fluxo/respostas';
import { DUAS_PESSOAS, EMPRESA, PESSOA_COM_CONJUGE, CONJUGE_UNIVERSAL, PESSOA_UNIVERSAL, UMA_PESSOA } from './exemplos';
import { PaginaPartes } from './PaginaPartes';

const meta: Meta<typeof PaginaPartes> = {
  title: 'Telas/1.2 - Dono do imóvel',
  component: PaginaPartes,
  args: {
    papel: 'locador',
    imovel: { uso: 'residencial', imovel: 'apartamento-condominio' },
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.tipoDeLocacao),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.administracao),
    onVoltarAoPrazo: () => irParaSecao('valores', 'va-prazo'),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Proprietário (locador): pessoa ou empresa, com os dados e o endereço. Depois, "Haverá mais de um proprietário?"; se sim, dados do segundo e como ficam as cobranças entre eles. Cada bloco pode ser salvo e importado num arquivo .json no computador. Campos conforme o fluxo do cliente; o que não está no fluxo (por exemplo, quais dados exatos pedir da empresa) precisa de confirmação.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPartes>;

export const Padrao: Story = { name: 'Padrão' };

export const UmaPessoa: Story = { name: 'Uma pessoa, só um proprietário', args: { inicial: UMA_PESSOA } };

export const Empresa: Story = {
  name: 'Uma empresa',
  args: { inicial: { principal: EMPRESA, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null } },
};

export const MaisDeUm: Story = { name: 'Mais de um proprietário', args: { inicial: DUAS_PESSOAS } };

export const PrazoLongo: Story = { name: 'Casado(a) com prazo de 10 anos (cônjuge necessário)', args: { prazoMeses: 120, inicial: UMA_PESSOA } };
export const PrazoLongoConjuge: Story = { name: 'Casado(a) com prazo de 10 anos (cônjuge já informado)', args: { prazoMeses: 120, inicial: { ...UMA_PESSOA, principal: PESSOA_COM_CONJUGE } } };

export const ComunhaoUniversal: Story = { name: 'Casado(a) em comunhão universal (cônjuge entra como outro proprietário)', args: { inicial: { ...UMA_PESSOA, principal: PESSOA_UNIVERSAL } } };
export const ComunhaoUniversalConjuge: Story = { name: 'Casado(a) em comunhão universal (cônjuge já informado)', args: { inicial: { principal: PESSOA_UNIVERSAL, segundo: CONJUGE_UNIVERSAL, maisDeUm: true, compartilhado: true } } };

export const ComErros: Story = {
  name: 'Com informações faltando',
  args: { mostrarErros: true, inicial: { principal: { ...LOCADOR_VAZIO, tipo: 'pessoa', nome: 'Maria Souza Lima', documento: '123.456.789-00' } } },
};

import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { LOCADOR_VAZIO } from '../fluxo/respostas';
import { DUAS_PESSOAS, EMPRESA, CONJUGE_UNIVERSAL, PESSOA, PESSOA_UNIVERSAL } from './exemplos';
import { PaginaPartes } from './PaginaPartes';

const meta: Meta<typeof PaginaPartes> = {
  title: 'Telas/1.4 - Quem vai alugar',
  component: PaginaPartes,
  args: {
    papel: 'locatario',
    imovel: { uso: 'residencial', imovel: 'apartamento-condominio' },
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.administracao),
    onVoltarAoPrazo: () => irParaSecao('valores', 'va-prazo'),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.imovel),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Inquilino (locatário): quem vai ocupar o imóvel ou assina a locação. Mesmo fluxo do proprietário: dados, "Haverá mais de uma pessoa alugando?" e, se sim, dados do segundo e como ficam as responsabilidades entre eles. Não tem importar/salvar arquivo, porque quem está alugando muda a cada contrato. Os dados pedidos de quem está alugando ainda precisam de confirmação com o cliente.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPartes>;

export const Padrao: Story = { name: 'Padrão' };

export const UmInquilino: Story = {
  name: 'Uma pessoa',
  args: { inicial: { principal: { ...PESSOA, nome: 'Pedro Alves Costa', documento: '390.533.447-05' }, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null } },
};

export const Empresa: Story = {
  name: 'Uma empresa',
  args: { inicial: { principal: EMPRESA, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null } },
};

export const MaisDeUm: Story = { name: 'Mais de uma pessoa alugando', args: { inicial: { ...DUAS_PESSOAS, compartilhado: false } } };

const INQUILINO_UNIVERSAL = { ...PESSOA_UNIVERSAL, nome: 'Pedro Alves Costa', documento: '390.533.447-05' };
export const ComunhaoUniversal: Story = {
  name: 'Casado(a) em comunhão universal (cônjuge entra como outra pessoa alugando)',
  args: { inicial: { principal: INQUILINO_UNIVERSAL, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null } },
};
export const ComunhaoUniversalConjuge: Story = {
  name: 'Casado(a) em comunhão universal (cônjuge já informado)',
  args: { inicial: { principal: INQUILINO_UNIVERSAL, segundo: { ...CONJUGE_UNIVERSAL, nome: 'Ana Alves Costa', documento: '529.982.247-25' }, maisDeUm: true, compartilhado: true } },
};

export const ComErros: Story = {
  name: 'Com informações faltando',
  args: { mostrarErros: true, inicial: { principal: { ...LOCADOR_VAZIO, tipo: 'empresa', nome: 'Empresa Exemplo Ltda.' }, maisDeUm: true } },
};

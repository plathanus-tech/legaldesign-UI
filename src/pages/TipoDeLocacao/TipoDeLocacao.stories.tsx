import type { Meta, StoryObj } from '@storybook/react';
import { LOCADOR_VAZIO } from '../fluxo/respostas';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { TipoDeLocacao } from './TipoDeLocacao';

const meta: Meta<typeof TipoDeLocacao> = {
  title: 'Telas/1.1 - Tipo de locação e de imóvel',
  component: TipoDeLocacao,
  args: { onSair: () => irPara(TELAS.inicio), onIrParaSecao: irParaSecao, onVoltarAoResumo: () => irPara(TELAS.resumo), onSeguinte: () => irPara(TELAS.dono) },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Primeira página do preenchimento: duas escolhas em cards (uso e como é o imóvel), com o resumo em árvore ao lado. Sem login. As opções de imóvel comercial e a opção Temporada ainda precisam ser confirmadas com o cliente.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TipoDeLocacao>;

export const Padrao: Story = { name: 'Padrão', args: { persistir: true } };

export const UsoEscolhido: Story = {
  name: 'Uso escolhido (residencial)',
  args: { inicial: { uso: 'residencial' } },
};

export const Completo: Story = {
  name: 'Tudo escolhido (apartamento em condomínio)',
  args: { inicial: { uso: 'residencial', imovel: 'apartamento-condominio' } },
};

export const Comercial: Story = {
  name: 'Comercial escolhido',
  args: { inicial: { uso: 'comercial', imovel: 'condominio' } },
};

export const MudouParaComercial: Story = {
  name: 'Mudou o uso (índice pede revisão)',
  args: {
    inicial: { uso: 'comercial', imovel: 'condominio' },
    usoAoPreencherLocador: 'residencial',
    locador: {
      maisDeUm: false,
      compartilhado: null,
      segundo: LOCADOR_VAZIO,
      principal: {
        ...LOCADOR_VAZIO, tipo: 'pessoa', nome: 'Maria Souza Lima', documento: '529.982.247-25', nacionalidade: 'Brasileira', profissao: 'Professora',
        estadoCivil: 'Solteiro(a)', cep: '01310-100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { irPara, irParaSecao, TELAS } from '../../prototype/navegar';
import { PaginaPerguntas } from '../fluxo/PaginaPerguntas';
import { IMOVEL_EXEMPLO } from './exemplos';

const meta: Meta<typeof PaginaPerguntas> = {
  title: 'Telas/1.5 - Dados do imóvel',
  component: PaginaPerguntas,
  args: {
    pagina: 'imovel',
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.inquilino),
    onVoltarAoResumo: () => irPara(TELAS.resumo),
    onSeguinte: () => irPara(TELAS.valores),
    onIrParaSecao: irParaSecao,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Endereço do imóvel (o CEP preenche rua, bairro, cidade e estado), matrícula (opcional), se vem com móveis ou utensílios (sem lista, ou "com inventário": aí a pessoa lista cada item, a quantidade e o estado, ali mesmo na página) e se tem vaga de garagem. Os campos desta página ainda precisam de confirmação com o cliente.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PaginaPerguntas>;

export const Padrao: Story = { name: 'Padrão' };
export const Preenchida: Story = { name: 'Preenchida', args: { inicial: IMOVEL_EXEMPLO } };
export const ComInventario: Story = { name: 'Sim, com inventário', args: { inicial: { ...IMOVEL_EXEMPLO, 'im-mobiliado': 'inventario', 'im-inventario': JSON.stringify([{ item: 'Geladeira', qtd: '1', estado: 'bom' }, { item: 'Cadeira', qtd: '4', estado: 'usado' }]) } } };
export const InventarioComErros: Story = { name: 'Inventário com informações faltando', args: { mostrarErros: true, inicial: { ...IMOVEL_EXEMPLO, 'im-mobiliado': 'inventario', 'im-inventario': '[]' } } };
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { 'im-cep': '01310-100', 'im-logradouro': 'Avenida Paulista' } } };

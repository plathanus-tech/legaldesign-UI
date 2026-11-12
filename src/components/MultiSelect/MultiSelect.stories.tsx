import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { Button } from '../Button/Button';
import { MultiSelect } from './MultiSelect';

const interests = [
  { label: 'Design', value: 'design' },
  { label: 'Desenvolvimento', value: 'dev', description: 'Front-end, back-end e mobile' },
  { label: 'Produto', value: 'produto' },
  { label: 'Dados', value: 'dados', description: 'Análise e engenharia de dados' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Atendimento', value: 'atendimento' },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ width: 320, paddingBottom: 300 }}><S /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Seleção de várias opções. O menu (com checkboxes) continua aberto a cada escolha e as opções marcadas aparecem como tags removíveis dentro do campo, que cresce em altura quando elas quebram de linha. Mesmo visual, teclado e posicionamento do `Dropdown` (portal, abre para cima quando falta espaço, folha inferior em telas ≤ 640px). Para uma única escolha, use `Dropdown`; para poucas opções sempre visíveis, prefira um grupo de `Checkbox`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  name: 'Padrão',
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelect label="Áreas de interesse" options={interests} value={value} onChange={setValue} placeholder="Escolha as áreas" />;
  },
};

/** Tags quebram de linha e o campo cresce; cada tag tem um botão de remover com nome acessível (`removeLabel`). */
export const WithPreselected: Story = {
  name: 'Com itens selecionados',
  render: () => {
    const [value, setValue] = useState<string[]>(['design', 'dev', 'dados', 'atendimento']);
    return <MultiSelect label="Áreas de interesse" options={interests} value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  name: 'Com erro',
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        label="Áreas de interesse" options={interests} value={value} onChange={setValue} required
        error={value.length ? undefined : 'Escolha ao menos uma área.'}
      />
    );
  },
};

export const Disabled: Story = {
  name: 'Desabilitado',
  render: () => <MultiSelect label="Áreas de interesse" options={interests} value={['produto']} onChange={() => {}} disabled />,
};

/** Sem opções disponíveis: `emptyText`, `emptyIcon` e `emptyAction` (a ação fecha o menu). */
export const Empty: Story = {
  name: 'Lista vazia',
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        label="Etiquetas" optional options={[]} value={value} onChange={setValue}
        emptyText="Nenhuma etiqueta cadastrada"
        emptyIcon={<Tags size={24} />}
        emptyAction={<Button variant="ghost" size="sm" iconLeft={<Plus size={16} />}>Criar etiqueta</Button>}
      />
    );
  },
};

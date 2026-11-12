import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ArrowDownUp, CircleQuestionMark, Eye, FolderOpen, Pencil, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { Dropdown } from './Dropdown';

const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
];

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ width: 280, paddingBottom: 280 }}><S /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Seleção de uma opção (combobox ARIA com teclado). O menu abre em portal com posição fixa, então não é cortado dentro de `Dialog` ou `Card`; abre para cima quando falta espaço abaixo. Em telas ≤ 640px vira folha inferior com fundo escurecido. Use `searchable` para listas longas e `MultiSelect` para várias escolhas.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return <Dropdown options={options} value={val} onChange={setVal} label="Framework" placeholder="Escolha um framework" />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [val, setVal] = useState('react');
    return <Dropdown options={options} value={val} onChange={setVal} aria-label="Framework" placeholder="Escolha um framework" />;
  },
};

export const Disabled: Story = {
  render: () => (
    <Dropdown options={options} disabled placeholder="Indisponível" label="Framework" />
  ),
};

export const WithError: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <Dropdown
        options={options}
        value={val}
        onChange={setVal}
        label="Framework"
        placeholder="Escolha um framework"
        error="Selecione uma opção para continuar"
      />
    );
  },
};

const cities = [
  { label: 'São Paulo', value: 'sp', description: 'SP · Sudeste', keywords: 'sampa' },
  { label: 'Rio de Janeiro', value: 'rj', description: 'RJ · Sudeste' },
  { label: 'Belo Horizonte', value: 'bh', description: 'MG · Sudeste', keywords: 'bh' },
  { label: 'Porto Alegre', value: 'poa', description: 'RS · Sul', keywords: 'poa' },
  { label: 'Florianópolis', value: 'floripa', description: 'SC · Sul', keywords: 'floripa' },
  { label: 'Curitiba', value: 'cwb', description: 'PR · Sul' },
  { label: 'Salvador', value: 'ssa', description: 'BA · Nordeste' },
  { label: 'Recife', value: 'rec', description: 'PE · Nordeste' },
  { label: 'Fortaleza', value: 'for', description: 'CE · Nordeste' },
  { label: 'Belém', value: 'bel', description: 'PA · Norte' },
  { label: 'Manaus', value: 'mao', description: 'AM · Norte' },
  { label: 'Goiânia', value: 'gyn', description: 'GO · Centro-Oeste' },
];

/** `searchable`: campo de busca no topo da lista. Ignora acentos ("goiania" encontra "Goiânia") e considera `description` e `keywords`. */
export const Searchable: Story = {
  name: 'Com busca',
  render: () => {
    const [val, setVal] = useState('');
    return (
      <Dropdown
        searchable options={cities} value={val} onChange={setVal}
        label="Cidade" placeholder="Escolha uma cidade" searchPlaceholder="Buscar cidade"
      />
    );
  },
};

/** Busca sem resultado: `emptyText`, `emptyIcon` e `emptyAction` (a ação fecha o menu ao ser acionada). */
export const EmptyResult: Story = {
  name: 'Lista vazia',
  render: () => (
    <Dropdown
      options={[]} label="Projeto" placeholder="Escolha um projeto"
      emptyText="Nenhum projeto cadastrado"
      emptyIcon={<FolderOpen size={24} />}
      emptyAction={<Button variant="ghost" size="sm" iconLeft={<Plus size={16} />}>Criar projeto</Button>}
    />
  ),
};

/** Opções com `description` e `leading` (elemento à esquerda que acompanha `--option-leading-size`). */
export const RichOptions: Story = {
  name: 'Opções com descrição',
  render: () => {
    const [val, setVal] = useState('editor');
    const roles = [
      { label: 'Administrador', value: 'admin', description: 'Acesso total, incluindo cobrança', leading: <ShieldCheck size={20} /> },
      { label: 'Editor', value: 'editor', description: 'Cria e edita conteúdo', leading: <Pencil size={20} /> },
      { label: 'Leitor', value: 'viewer', description: 'Só visualiza', leading: <Eye size={20} /> },
    ];
    return <Dropdown options={roles} value={val} onChange={setVal} label="Permissão" />;
  },
};

/** `summary`: conteúdo fixo no campo (ex.: "Ordenar") para controles estreitos. Informe o valor atual no `aria-label`. */
export const Summary: Story = {
  name: 'Resumo fixo no campo',
  render: () => {
    const [val, setVal] = useState('recentes');
    const sort = [
      { label: 'Mais recentes', value: 'recentes' },
      { label: 'Mais antigos', value: 'antigos' },
      { label: 'Nome (A–Z)', value: 'nome' },
    ];
    const current = sort.find((o) => o.value === val)?.label;
    return (
      <div style={{ width: 160 }}>
        <Dropdown
          size="sm" options={sort} value={val} onChange={setVal}
          aria-label={`Ordenar por: ${current}`}
          summary={<><ArrowDownUp size={16} aria-hidden="true" /> Ordenar</>}
        />
      </div>
    );
  },
};

/** `size="sm"`: 36px visíveis (área de toque de 44px) com texto Body/S, para filtros de tabela. Formulários usam o padrão. */
export const CompactFilter: Story = {
  name: 'Compacto (filtros)',
  render: () => {
    const [val, setVal] = useState('react');
    return <Dropdown size="sm" options={options} value={val} onChange={setVal} label="Framework" />;
  },
};

/** `optional` e `labelAction` são repassados ao `FormField`. */
export const OptionalWithHelp: Story = {
  name: 'Opcional com ajuda',
  render: () => {
    const [val, setVal] = useState('');
    return (
      <Dropdown
        options={options} value={val} onChange={setVal} label="Framework" optional
        labelAction={<Button variant="ghost" size="sm" iconOnly aria-label="Sobre o campo Framework" iconLeft={<CircleQuestionMark size={16} />} />}
      />
    );
  },
};

/** O menu é renderizado em portal com posição fixa: não é cortado pelo corpo rolável do `Dialog`. */
export const InsideDialog: Story = {
  name: 'Dentro de Dialog',
  render: () => {
    const [open, setOpen] = useState(false);
    const [val, setVal] = useState('');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Nova entrega" size="sm">
          <Dropdown searchable options={cities} value={val} onChange={setVal} label="Cidade de destino" />
        </Dialog>
      </>
    );
  },
};

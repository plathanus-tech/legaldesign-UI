import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pencil, Trash2, Eye, MoreHorizontal, Search, Download, Plus, Wrench } from 'lucide-react';
import { Table } from './Table';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Dropdown } from '../Dropdown/Dropdown';
import { Input } from '../Input/Input';

type Product = {
  avatar:   string;
  name:     string;
  category: string;
  price:    string;
  stock:    string;
  status:   string;
  active:   boolean;
  link:     string;
};

const rows: Product[] = [
  { avatar: '', name: 'Produto Alpha',   category: 'Eletrônicos', price: 'R$ 299,00',   stock: '42',  status: 'active',   active: true,  link: 'Ver detalhes' },
  { avatar: '', name: 'Produto Beta',    category: 'Vestuário',   price: 'R$ 89,90',    stock: '7',   status: 'warning',  active: false, link: 'Ver detalhes' },
  { avatar: '', name: 'Produto Gamma',   category: 'Alimentos',   price: 'R$ 12,50',    stock: '150', status: 'active',   active: true,  link: 'Ver detalhes' },
  { avatar: '', name: 'Produto Delta',   category: 'Livros',      price: 'R$ 49,00',    stock: '0',   status: 'inactive', active: false, link: 'Ver detalhes' },
  { avatar: '', name: 'Produto Epsilon', category: 'Eletrônicos', price: 'R$ 1.299,00', stock: '5',   status: 'active',   active: true,  link: 'Ver detalhes' },
];

const statusMap = {
  active:   { label: 'Ativo',    status: 'success' as const },
  inactive: { label: 'Inativo',  status: 'error'   as const },
  warning:  { label: 'Pendente', status: 'warning' as const },
};

const meta: Meta<typeof Table<Product>> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ padding: 32 }}><S /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Tabela de dados configurada por colunas (`type`: text, link, badge, avatar, toggle, actions). Renderiza dentro de um `Card`. Linhas alternam em escala de cinza: a primeira fica cinza (separando-se do cabeçalho) e a seguinte usa a cor da tabela. **A coluna de ações (`type: actions`) é sempre a última e fica fixa à direita; só as demais colunas rolam na horizontal.** Colunas de ações com `render` próprio usam `sticky: "right"`. Para paginar, use a prop `pagination` (rodapé dentro da tabela, com "Mostrando X–Y de Z" e `Pagination`); busca e filtros vão em `toolbar` e ações do cabeçalho em `actions`. Sem linhas, exibe um `EmptyState` (personalize com `empty`).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Table<Product>>;

export const Default: Story = {
  render: () => {
    const [data, setData] = useState(rows);

    const columns = [
      { key: 'avatar' as const, label: 'Foto', type: 'avatar' as const, nameKey: 'name' as const, width: 60 },
      { key: 'name' as const, label: 'Produto' },
      { key: 'category' as const, label: 'Categoria' },
      { key: 'price' as const, label: 'Preço' },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
      {
        key: 'active' as const,
        label: 'Ativo',
        type: 'toggle' as const,
        width: 80,
        onToggle: (row: Product, value: boolean) =>
          setData(d => d.map(r => r.name === row.name ? { ...r, active: value } : r)),
      },
      {
        key: 'name' as const,
        label: 'Ações',
        type: 'actions' as const,
        width: 120,
        actionItems: [
          { icon: <Eye size={16} />,    label: 'Visualizar', onClick: (r: Product) => alert(`Ver: ${r.name}`) },
          { icon: <Pencil size={16} />, label: 'Editar',     onClick: (r: Product) => alert(`Editar: ${r.name}`) },
          { icon: <Trash2 size={16} />, label: 'Excluir',    onClick: (r: Product) => alert(`Excluir: ${r.name}`), danger: true },
        ],
      },
    ];

    return <Table title="Produtos" subtitle={`Mostrando ${data.length} produtos`} columns={columns} rows={data} />;
  },
};

export const Sortable: Story = {
  render: () => {
    const [data, setData] = useState(rows);
    const [sortKey, setSortKey] = useState<keyof Product | undefined>();
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: keyof Product) => {
      const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      setSortKey(key); setSortDir(dir);
      setData(d => [...d].sort((a, b) =>
        dir === 'asc'
          ? String(a[key]).localeCompare(String(b[key]))
          : String(b[key]).localeCompare(String(a[key]))
      ));
    };

    const columns = [
      { key: 'name' as const, label: 'Produto', sortable: true },
      { key: 'category' as const, label: 'Categoria', sortable: true },
      { key: 'price' as const, label: 'Preço', sortable: true },
      { key: 'stock' as const, label: 'Estoque', sortable: true, align: 'right' as const },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
    ];

    return (
      <Table
        title="Produtos" subtitle="Clique no cabeçalho para ordenar"
        columns={columns} rows={data} onSort={handleSort} sortKey={sortKey} sortDir={sortDir}
      />
    );
  },
};

export const WithLinks: Story = {
  render: () => {
    const columns = [
      { key: 'name' as const, label: 'Produto' },
      { key: 'category' as const, label: 'Categoria' },
      { key: 'link' as const, label: 'Link', type: 'link' as const, onLinkClick: (r: Product) => alert(`Abrir: ${r.name}`) },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
      {
        key: 'name' as const, label: 'Ações', type: 'actions' as const, width: 80,
        actionItems: [{ icon: <MoreHorizontal size={16} />, label: 'Mais opções', onClick: (r: Product) => alert(r.name) }],
      },
    ];
    return <Table title="Produtos" columns={columns} rows={rows} />;
  },
};

export const StickyActions: Story = {
  name: 'Ações fixas com rolagem',
  parameters: {
    docs: {
      description: {
        story:
          '**Regra:** a coluna `actions` fica sempre fixa à direita e só as demais colunas rolam na horizontal. O componente move a coluna de ações para o fim automaticamente, mesmo que ela venha antes no array `columns`. Use uma única coluna `actions` por tabela.',
      },
    },
  },
  render: () => {
    const columns = [
      {
        key: 'name' as const, label: 'Ações', type: 'actions' as const, width: 120,
        actionItems: [
          { icon: <Eye size={16} />,    label: 'Visualizar', onClick: (r: Product) => alert(`Ver: ${r.name}`) },
          { icon: <Pencil size={16} />, label: 'Editar',     onClick: (r: Product) => alert(`Editar: ${r.name}`) },
          { icon: <Trash2 size={16} />, label: 'Excluir',    onClick: (r: Product) => alert(`Excluir: ${r.name}`), danger: true },
        ],
      },
      { key: 'avatar' as const, label: 'Foto', type: 'avatar' as const, nameKey: 'name' as const, width: 60 },
      { key: 'name' as const, label: 'Produto', width: 200 },
      { key: 'category' as const, label: 'Categoria', width: 180 },
      { key: 'price' as const, label: 'Preço', width: 160 },
      { key: 'stock' as const, label: 'Estoque', align: 'right' as const, width: 140 },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap, width: 160 },
      { key: 'link' as const, label: 'Link', type: 'link' as const, width: 160 },
    ];
    return (
      <div style={{ maxWidth: 640 }}>
        <Table title="Produtos" subtitle="Role na horizontal: as ações continuam visíveis" columns={columns} rows={rows} />
      </div>
    );
  },
};

const simpleColumns = [
  { key: 'name' as const, label: 'Produto' },
  { key: 'category' as const, label: 'Categoria' },
  { key: 'price' as const, label: 'Preço' },
];

export const Loading: Story = {
  render: () => <Table title="Produtos" columns={simpleColumns} rows={[]} loading />,
};

/* ── Estados vazios ────────────────────────────────────────────────────────
   Padrão: a tabela mantém título, busca, filtros e cabeçalho; só a área das linhas vira EmptyState. */

type Equipment = { name: string; code: string; place: string; status: string };
const equipment: Equipment[] = [
  { name: 'Compressor de ar',  code: 'PAT-0012', place: 'Galpão A',     status: 'active' },
  { name: 'Empilhadeira',      code: 'PAT-0031', place: 'Doca 2',       status: 'warning' },
  { name: 'Gerador a diesel',  code: 'PAT-0047', place: 'Casa de força', status: 'active' },
];
const equipmentColumns = [
  { key: 'name' as const, label: 'Equipamento', sortable: true },
  { key: 'code' as const, label: 'Patrimônio' },
  { key: 'place' as const, label: 'Local' },
  { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
  {
    key: 'name' as const, label: 'Ações', type: 'actions' as const,
    actionItems: [
      { icon: <Pencil size={16} />, label: 'Editar', onClick: () => {} },
      { icon: <Trash2 size={16} />, label: 'Excluir', onClick: () => {}, danger: true },
    ],
  },
];

function EquipmentTable({ data, initialQuery = '', withRecords }: { data: Equipment[]; initialQuery?: string; withRecords: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState('todos');
  const rowsShown = data.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) && (status === 'todos' || r.status === status));
  const newButton = <Button iconLeft={<Plus size={20} />}>Novo equipamento</Button>;
  return (
    <Table
      title="Equipamentos"
      columns={equipmentColumns}
      rows={rowsShown}
      actions={withRecords ? newButton : undefined}
      emptyVariant={withRecords ? 'no-results' : 'no-records'}
      empty={withRecords ? undefined : {
        icon: <Wrench size={40} />,
        title: 'Nenhum equipamento cadastrado',
        description: 'Cadastre o primeiro equipamento para acompanhar local, patrimônio e status por aqui.',
        action: newButton,
      }}
      onClearFilters={() => { setQuery(''); setStatus('todos'); }}
      toolbar={(
        <>
          <Input
            type="search" aria-label="Buscar equipamento" placeholder="Buscar equipamento"
            iconLeft={<Search size={20} />} value={query} onChange={e => setQuery(e.target.value)}
          />
          <Dropdown
            aria-label="Filtrar por status" value={status} onChange={setStatus}
            options={[
              { label: 'Todos os status', value: 'todos' },
              { label: 'Ativo', value: 'active' },
              { label: 'Em manutenção', value: 'warning' },
              { label: 'Inativo', value: 'inactive' },
            ]}
          />
        </>
      )}
    />
  );
}

/**
 * **Sem cadastros** (`emptyVariant="no-records"`): o módulo ainda não tem registros.
 * Mantém título, busca, filtros e cabeçalho; a área das linhas mostra o ícone do módulo, um título contextual,
 * a orientação do próximo passo e o botão de criação. Busca e filtros ficam **desabilitados** (não há o que
 * buscar) e a ordenação do cabeçalho é desativada. O botão de criação aparece só no estado vazio, sem duplicar
 * no cabeçalho do card.
 */
export const EmptyNoRecords: Story = {
  name: 'Vazio: sem cadastros',
  render: () => <EquipmentTable data={[]} withRecords={false} />,
};

/**
 * **Nenhum resultado** (`emptyVariant="no-results"`, padrão): a busca ou os filtros não retornaram registros.
 * Ícone fixo (lupa), igual em todos os módulos; textos padrão sobrescrevíveis por `empty`/`emptyLabels`; com
 * `onClearFilters`, mostra "Limpar busca e filtros". Busca e filtros continuam ativos. A mensagem é anunciada
 * ao leitor de tela (`role="status"`).
 */
export const EmptyNoResults: Story = {
  name: 'Vazio: nenhum resultado',
  render: () => <EquipmentTable data={equipment} initialQuery="bomba" withRecords />,
};

/** Paginação no rodapé da tabela (`pagination`): `rows` recebe só a página atual. O intervalo é anunciado (`aria-live`). */
export const WithPagination: Story = {
  name: 'Com paginação',
  render: () => {
    const all = Array.from({ length: 23 }, (_, i) => ({ ...rows[i % rows.length], name: `Produto ${i + 1}` }));
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const columns = [
      { key: 'name' as const, label: 'Produto' },
      { key: 'category' as const, label: 'Categoria' },
      { key: 'price' as const, label: 'Preço' },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
    ];
    return (
      <Table
        title="Produtos"
        columns={columns}
        rows={all.slice((page - 1) * pageSize, page * pageSize)}
        pagination={{ page, pageSize, total: all.length, onPageChange: setPage }}
      />
    );
  },
};

/** Busca e filtro dentro da tabela (`toolbar`) e ação no cabeçalho do Card (`actions`). */
export const WithToolbar: Story = {
  name: 'Com busca, filtro e ações',
  render: () => {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('todos');
    const filtered = rows.filter(r =>
      r.name.toLowerCase().includes(query.toLowerCase()) && (status === 'todos' || r.status === status));
    const columns = [
      { key: 'name' as const, label: 'Produto' },
      { key: 'category' as const, label: 'Categoria' },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
    ];
    return (
      <Table
        title="Produtos"
        columns={columns}
        rows={filtered}
        onClearFilters={() => { setQuery(''); setStatus('todos'); }}
        actions={<Button size="sm" variant="outline" iconLeft={<Download size={16} />}>Exportar</Button>}
        toolbar={(
          <>
            <Input
              type="search" aria-label="Buscar produto" placeholder="Buscar produto"
              iconLeft={<Search size={20} />} value={query} onChange={e => setQuery(e.target.value)}
            />
            <Dropdown
              aria-label="Filtrar por status" value={status} onChange={setStatus}
              options={[
                { label: 'Todos os status', value: 'todos' },
                { label: 'Ativo', value: 'active' },
                { label: 'Pendente', value: 'warning' },
                { label: 'Inativo', value: 'inactive' },
              ]}
            />
          </>
        )}
      />
    );
  },
};

/**
 * `headerContent` troca o texto do cabeçalho por outro conteúdo (aqui, "selecionar todos"); `label` segue como
 * nome acessível. Uma coluna de ações com `render` próprio usa `sticky: 'right'` para ficar fixa como `type: 'actions'`.
 */
export const SelectionAndCustomSticky: Story = {
  name: 'Seleção e coluna fixa com render',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    const allSelected = selected.length === rows.length;
    const toggle = (name: string) =>
      setSelected(s => (s.includes(name) ? s.filter(n => n !== name) : [...s, name]));
    const columns = [
      {
        key: 'avatar' as const, label: 'Selecionar todos', width: 56,
        headerContent: (
          <Checkbox
            aria-label="Selecionar todos"
            checked={allSelected}
            indeterminate={selected.length > 0 && !allSelected}
            onChange={() => setSelected(allSelected ? [] : rows.map(r => r.name))}
          />
        ),
        render: (_: unknown, r: Product) => (
          <Checkbox aria-label={`Selecionar ${r.name}`} checked={selected.includes(r.name)} onChange={() => toggle(r.name)} />
        ),
      },
      { key: 'name' as const, label: 'Produto', width: 200 },
      { key: 'category' as const, label: 'Categoria', width: 180 },
      { key: 'price' as const, label: 'Preço', width: 160 },
      { key: 'stock' as const, label: 'Estoque', align: 'right' as const, width: 140 },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap, width: 160 },
      {
        key: 'link' as const, label: 'Ações', sticky: 'right' as const,
        render: (_: unknown, r: Product) => (
          <Button size="sm" variant="ghost" aria-label={`Abrir ${r.name}`} onClick={() => alert(`Abrir: ${r.name}`)}>Abrir</Button>
        ),
      },
    ];
    return (
      <div style={{ maxWidth: 640 }}>
        <Table
          title="Produtos"
          subtitle={`${selected.length} selecionado(s)`}
          columns={columns}
          rows={rows}
        />
      </div>
    );
  },
};

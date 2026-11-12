import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, ChartColumn, Receipt } from 'lucide-react';
import { Sidebar, NavItemDef } from './Sidebar';
import { Card } from '../Card/Card';
import { Stack } from '../Stack/Stack';

const items: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'users',     label: 'Usuários',  icon: <Users size={20} />, dot: true, dotLabel: 'Novos usuários' },
  { id: 'reports',   label: 'Relatórios', icon: <FileText size={20} /> },
  { id: 'settings',  label: 'Configurações', icon: <Settings size={20} /> },
];

/** Logo de exemplo: cada projeto passa a sua própria (img, svg ou texto). */
const logo = {
  full: <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--color-nav-text)' }}>Produto</strong>,
  icon: <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--color-nav-text)' }}>P</strong>,
};

const user = { name: 'Maria Silva', email: 'maria@exemplo.com' };

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'var(--color-bg-default)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function Content({ title }: { title: string }) {
  return (
    <main style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
      <Stack gap="lg">
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-secondary)' }}>{title}</h1>
        <Card title="Conteúdo" subtitle="Área principal da página">Conteúdo de exemplo.</Card>
      </Stack>
    </main>
  );
}

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Navegação lateral recolhível para áreas logadas. Recebe `items`, `logo` e `user` por props; permissões por papel são aplicadas pelo produto antes de passar `items`. Itens com `children` viram grupos recolhíveis; `themeToggle` e `version` aparecem no pé; `variant="menu"` serve ao painel de menu mobile.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Open: Story = {
  render: () => (
    <AppLayout>
      <Sidebar items={items} logo={logo} user={user} onLogout={() => undefined} open activeItem="dashboard" />
      <Content title="Dashboard" />
    </AppLayout>
  ),
};

export const Closed: Story = {
  render: () => (
    <AppLayout>
      <Sidebar items={items} logo={logo} user={user} onLogout={() => undefined} open={false} activeItem="dashboard" />
      <Content title="Dashboard" />
    </AppLayout>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState('dashboard');
    const current = items.find(i => i.id === active)?.label ?? '';
    return (
      <AppLayout>
        <Sidebar
          items={items} logo={logo} user={user} onLogout={() => undefined}
          open={open} onToggle={() => setOpen(o => !o)} activeItem={active} onNavClick={setActive}
        />
        <Content title={current} />
      </AppLayout>
    );
  },
};

const itemsWithHref: NavItemDef[] = items.map(i => ({ ...i, href: `/${i.id}` }));

export const WithRealLinks: Story = {
  name: 'Navegação com links reais',
  parameters: {
    docs: {
      description: {
        story:
          'Itens com `href` são renderizados como `<a>` de verdade (Ctrl/Cmd+clique abre em nova aba, "copiar link" funciona etc.). ' +
          'Para usar o componente de rota da sua aplicação (React Router, Next.js…), passe um adaptador em `linkComponent` que receba `href` e o repasse à prop de destino do seu roteador (`to`, `href`…).',
      },
    },
  },
  render: () => (
    <AppLayout>
      <Sidebar items={itemsWithHref} logo={logo} user={user} onLogout={() => undefined} open activeItem="dashboard" />
      <Content title="Dashboard" />
    </AppLayout>
  ),
};

const itemsWithGroups: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  {
    id: 'reports', label: 'Relatórios', icon: <ChartColumn size={20} />,
    children: [
      { id: 'reports-sales', label: 'Vendas' },
      { id: 'reports-customers', label: 'Clientes' },
      { id: 'reports-billing', label: 'Faturamento', icon: <Receipt size={20} /> },
    ],
  },
  { id: 'users', label: 'Usuários', icon: <Users size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

const allLabels = itemsWithGroups.flatMap(i => [{ id: i.id, label: i.label }, ...(i.children ?? [])]);

export const WithGroups: Story = {
  name: 'Grupos com subitens',
  parameters: {
    docs: {
      description: {
        story:
          'Itens com `children` viram grupos recolhíveis (`aria-expanded`/`aria-controls`, subitens em `role="group"`). ' +
          'O grupo que contém o item ativo abre sozinho. Com o menu recolhido, clicar no grupo abre o menu e expande o grupo.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState('reports-sales');
    return (
      <AppLayout>
        <Sidebar
          items={itemsWithGroups} logo={logo} user={user} onLogout={() => undefined}
          open={open} onToggle={() => setOpen(o => !o)} activeItem={active} onNavClick={setActive}
        />
        <Content title={allLabels.find(i => i.id === active)?.label ?? ''} />
      </AppLayout>
    );
  },
};

export const WithThemeAndVersion: Story = {
  name: 'Seletor de tema e versão',
  parameters: {
    docs: {
      description: {
        story:
          '`themeToggle` exibe um controle segmentado Claro/Escuro (`aria-pressed`) abaixo do usuário; recolhido, mostra só os ícones. ' +
          'Os textos vêm de `themeToggle.labels` (padrão em pt-BR). `version` aparece em texto pequeno no fim do menu.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    const [dark, setDark] = useState(false);
    return (
      <AppLayout>
        <Sidebar
          items={items} logo={logo} user={user} onLogout={() => undefined} activeItem="dashboard"
          open={open} onToggle={() => setOpen(o => !o)}
          themeToggle={{ dark, onChange: setDark }}
          version="v1.0.0"
        />
        <Content title={dark ? 'Tema escuro selecionado' : 'Tema claro selecionado'} />
      </AppLayout>
    );
  },
};

export const MenuVariant: Story = {
  name: 'Variante menu (mobile)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          '`variant="menu"`: só a lista de links, em largura total e sempre aberta, para o painel aberto abaixo do header no mobile. ' +
          'Sem logo e sem botão de recolher (ficam no header); usuário e saída ficam no pé.',
      },
    },
  },
  render: () => {
    const [active, setActive] = useState('dashboard');
    return (
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--color-bg-default)' }}>
        <Sidebar
          variant="menu" items={itemsWithGroups} logo={logo} user={user} onLogout={() => undefined}
          activeItem={active} onNavClick={setActive}
        />
      </div>
    );
  },
};

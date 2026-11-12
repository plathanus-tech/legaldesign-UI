import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { Funnel } from 'lucide-react';
import { Popover } from './Popover';
import { Button } from '../Button/Button';
import { Dropdown } from '../Dropdown/Dropdown';
import { Stack } from '../Stack/Stack';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ minHeight: 360, display: 'flex', justifyContent: 'flex-end' }}><S /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Painel flutuante ancorado a um botão, para controles de apoio (ex.: filtros de uma tabela). Renderiza em portal, fecha com Esc e ao clicar fora e devolve o foco ao botão. Campos com menu próprio (`Dropdown`, `MultiSelect`, `DatePicker`) funcionam dentro dele: com um menu aberto, Esc e clique fora fecham só o menu. O botão deve informar `aria-haspopup="dialog"` e `aria-expanded`. Para conteúdo que exige decisão ou foco preso, use `Dialog`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Popover>;

const statusOptions = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

export const Filters: Story = {
  name: 'Filtros',
  render: () => {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState('todos');
    const ref = useRef<HTMLSpanElement>(null);
    return (
      <>
        <span ref={ref}>
          <Button variant="outline" iconLeft={<Funnel size={16} />} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            Filtros
          </Button>
        </span>
        <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} label="Filtros">
          <Stack gap="md">
            <Dropdown size="sm" label="Status" options={statusOptions} value={status} onChange={setStatus} />
            <Stack direction="horizontal" justify="end" gap="sm">
              <Button size="sm" variant="secondary" onClick={() => { setStatus('todos'); setOpen(false); }}>Limpar</Button>
              <Button size="sm" onClick={() => setOpen(false)}>Aplicar</Button>
            </Stack>
          </Stack>
        </Popover>
      </>
    );
  },
};

/** `fit` + `align="start"`: menu de ações curto, que no mobile se ajusta ao conteúdo. */
export const ActionsMenu: Story = {
  name: 'Menu de ações',
  decorators: [(S) => <div style={{ minHeight: 240 }}><S /></div>],
  render: () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    return (
      <>
        <span ref={ref}>
          <Button variant="outline" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Exportar</Button>
        </span>
        <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} label="Exportar" align="start" fit>
          <Stack gap="xs">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Exportar CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Exportar PDF</Button>
          </Stack>
        </Popover>
      </>
    );
  },
};

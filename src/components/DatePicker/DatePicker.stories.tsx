import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 320, minHeight: 420 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Seleção de data com campo digitável (máscara) e calendário acessível. Valor em ISO `YYYY-MM-DD`. Teclado no calendário: setas (dia/semana), Home/End (início/fim da semana), PageUp/PageDown (mês; com Shift, ano), Enter/Espaço (escolher), Esc (fechar). O calendário abre em portal com posição fixa: não é cortado dentro de `Dialog`/`Card`, abre para cima quando falta espaço abaixo, fica sempre dentro da viewport e centralizado em telas ≤ 640px. Use no lugar de `<input type="date">`, cujo calendário é do navegador.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

function Controlled(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <>
      <DatePicker {...props} value={value} onChange={setValue} />
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Valor: {value || '—'}</p>
    </>
  );
}

export const Default: Story = { render: () => <Controlled label="Data" /> };

export const WithValue: Story = { render: () => <Controlled label="Data da reunião" value="2026-09-18" /> };

export const MinMax: Story = {
  name: 'Com período permitido',
  render: () => <Controlled label="Agendamento" helperText="Somente datas de 1 a 30 de setembro de 2026." min="2026-09-01" max="2026-09-30" value="2026-09-18" />,
};

export const BirthDate: Story = {
  name: 'Data de nascimento',
  render: () => <Controlled label="Data de nascimento" autoComplete="bday" max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} required showShortcuts={false} />,
};

export const WithError: Story = { render: () => <Controlled label="Prazo" required error="Informe o prazo." /> };

export const Disabled: Story = { render: () => <Controlled label="Data" value="2026-09-18" disabled /> };

export const English: Story = {
  name: 'Inglês (en-US)',
  render: () => (
    <Controlled
      label="Date" locale="en-US" placeholder="mm/dd/yyyy" value="2026-09-18"
      labels={{ openCalendar: 'Open calendar', calendar: 'Choose date', previousMonth: 'Previous month', nextMonth: 'Next month', month: 'Month', year: 'Year', today: 'Today', clear: 'Clear', invalid: 'Invalid date.', outOfRange: 'Date out of range.' }}
    />
  ),
};

export const Optional: Story = {
  name: 'Opcional',
  render: () => <Controlled label="Data de retorno" optional helperText="Deixe em branco se ainda não souber." />,
};

/** `size="sm"`: 36px visíveis (área de toque de 44px mantida) com texto Body/S, para filtros de tabela. */
export const Compact: Story = {
  name: 'Compacto (filtros)',
  render: () => <Controlled label="Criado a partir de" size="sm" />,
};

/** Dentro de `Dialog`: o calendário fica acima do diálogo e não é cortado pelo corpo rolável. */
export const InsideDialog: Story = {
  name: 'Dentro de Dialog',
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Reagendar" size="sm">
          <DatePicker label="Nova data" value={value} onChange={setValue} />
        </Dialog>
      </>
    );
  },
};

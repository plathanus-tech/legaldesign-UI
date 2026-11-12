import type { Meta, StoryObj } from '@storybook/react';
import { CircleCheck, Clock, AlertCircle } from 'lucide-react';
import { Badge } from './Badge';
import { Stack } from '../Stack/Stack';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: { status: { control: 'select', options: ['neutral', 'brand', 'success', 'error', 'warning', 'info'] }, dot: { control: 'boolean' }, solid: { control: 'boolean' } },
  parameters: { docs: { description: { component: 'Rótulo de estado ou categoria. Não é clicável. Em tabelas, use `type: "badge"` na coluna.' } } },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'Rascunho' } };

export const AllStatuses: Story = {
  render: () => (
    <Stack direction="horizontal" gap="sm" wrap>
      <Badge>Neutro</Badge>
      <Badge status="brand">Destaque</Badge>
      <Badge status="success" dot>Ativo</Badge>
      <Badge status="error" dot>Inativo</Badge>
      <Badge status="warning" dot>Pendente</Badge>
      <Badge status="info" dot>Novo</Badge>
    </Stack>
  ),
};

/** Ícone no lugar do ponto: reforça o significado sem depender só da cor. Tem prioridade sobre `dot`. */
export const WithIcon: Story = {
  render: () => (
    <Stack direction="horizontal" gap="sm" wrap>
      <Badge status="success" icon={<CircleCheck size={14} />}>Concluído</Badge>
      <Badge status="warning" icon={<Clock size={14} />}>Aguardando</Badge>
      <Badge status="error" icon={<AlertCircle size={14} />}>Com erro</Badge>
    </Stack>
  ),
};

/** Destaque sólido de erro, só para um estado urgente pontual (ex.: prazo vencido), sempre com ícone e texto. */
export const SolidError: Story = {
  args: { status: 'error', solid: true, icon: <AlertCircle size={14} />, children: 'Prazo vencido' },
};

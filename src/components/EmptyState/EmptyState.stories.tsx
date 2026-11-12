import type { Meta, StoryObj } from '@storybook/react';
import { Inbox } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Estado vazio de lista ou seção: explica por que não há dados e oferece o próximo passo.' } } },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox size={40} />,
    title: 'Nenhum item ainda',
    description: 'Quando você criar o primeiro item, ele aparecerá aqui.',
    action: <Button>Criar item</Button>,
  },
};

/** Versão compacta: para cartões pequenos e telas de celular, onde o estado vazio não deve dominar a página. */
export const Compact: Story = {
  args: {
    compact: true,
    icon: <Inbox size={32} />,
    title: 'Nenhum item ainda',
    description: 'Quando você criar o primeiro item, ele aparecerá aqui.',
    action: <Button size="sm">Criar item</Button>,
  },
};

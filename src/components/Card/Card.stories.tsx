import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Stack } from '../Stack/Stack';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
  argTypes: { padding: { control: 'select', options: ['none', 'md', 'lg'] } },
  parameters: { docs: { description: { component: 'Superfície que agrupa conteúdo relacionado, com cabeçalho, ações e rodapé opcionais. Use `padding="none"` para tabelas e listas.' } } },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { title: 'Resumo da conta', subtitle: 'Dados atualizados hoje', children: 'Conteúdo do cartão.' },
};

export const WithActionsAndFooter: Story = {
  args: {
    title: 'Perfil',
    actions: <Button size="sm" variant="secondary">Editar</Button>,
    children: 'Informações do perfil do usuário.',
    footer: <><Button variant="ghost">Cancelar</Button><Button>Salvar</Button></>,
  },
};

/** `title` aceita conteúdo rico: aqui, texto + `Badge` de status. O heading continua sendo o nome da seção. */
export const TituloComBadge: Story = {
  name: 'Título com conteúdo rico',
  args: {
    title: (
      <Stack as="span" direction="horizontal" gap="sm" align="center">
        Plano atual <Badge status="success">Ativo</Badge>
      </Stack>
    ),
    subtitle: 'Renovação automática em 12/11',
    children: 'Detalhes do plano contratado.',
  },
};

/** Abaixo de 768px o espaçamento interno cai para 16px (cabeçalho, corpo e rodapé). */
export const Mobile: Story = {
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    title: 'Resumo da conta',
    subtitle: 'Dados atualizados hoje',
    children: 'Conteúdo do cartão.',
    footer: <><Button variant="ghost">Cancelar</Button><Button>Salvar</Button></>,
  },
};

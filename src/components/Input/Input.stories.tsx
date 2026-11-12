import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: 'Digite aqui...' } };
export const WithLabel: Story = { args: { label: 'Nome completo', placeholder: 'Ex: Maria Silva' } };
export const WithHelper: Story = { args: { label: 'E-mail', placeholder: 'seu@email.com', helperText: 'Usado para login.' } };
export const WithError: Story = { args: { label: 'Senha', type: 'password', value: '123', error: 'Senha deve ter ao menos 8 caracteres.', readOnly: true } };
export const WithIcons: Story = { args: { label: 'Buscar', iconLeft: <span>🔍</span>, iconRight: <span>✕</span>, placeholder: 'Pesquisar...' } };
export const Disabled: Story = { args: { label: 'Campo desabilitado', value: 'Valor fixo', disabled: true, readOnly: true } };
export const Search: Story = { args: { type: 'search', iconLeft: <span>🔍</span>, placeholder: 'Pesquisar produtos...' } };

export const Password: Story = {
  name: 'Senha (ícone clicável)',
  render: () => {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState('');
    return (
      <Input
        label="Senha"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="current-password"
        placeholder="Digite sua senha"
        iconRight={visible ? <EyeOff size={18} /> : <Eye size={18} />}
        onIconRightClick={() => setVisible(v => !v)}
        iconRightLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        iconRightPressed={visible}
      />
    );
  },
};

/** Limpar busca: ação simples, sem estado de alternância (sem `iconRightPressed`). */
export const ClearAction: Story = {
  name: 'Limpar busca (ação simples)',
  render: () => {
    const [value, setValue] = useState('Relatório mensal');
    return (
      <Input
        label="Buscar"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        iconRight={<X size={18} />}
        onIconRightClick={() => setValue('')}
        iconRightLabel="Limpar busca"
      />
    );
  },
};

/** Campos obrigatórios não levam marcação; só os opcionais mostram “(opcional)”. */
export const Optional: Story = {
  name: 'Opcional',
  args: { label: 'Telefone', type: 'tel', autoComplete: 'tel', optional: true, helperText: 'Usado só para avisos sobre o seu pedido.' },
};

/** `fieldSize="sm"`: rótulo compacto, para filtros de tabela. */
export const Compact: Story = {
  name: 'Compacto (filtros)',
  args: { label: 'Filtrar por nome', fieldSize: 'sm', placeholder: 'Digite um nome' },
};

export const ReadOnly: Story = {
  name: 'Somente leitura',
  args: { label: 'Código', value: 'CLI-00231', readOnly: true },
};

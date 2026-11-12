import type { Meta, StoryObj } from '@storybook/react';
import { CircleQuestionMark } from 'lucide-react';
import { Button } from '../Button/Button';
import { FormField, fieldControlClass } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Estrutura base de campo: label + controle + mensagem (ajuda/erro/sucesso), com `id`, `aria-describedby` e `aria-invalid` já ligados. `Input`, `Textarea`, `DatePicker` e `Dropdown` já usam FormField. Campos obrigatórios não levam marcação visual (é o padrão); marque os opcionais com `optional`, que exibe “(opcional)” — o texto é configurável por `optionalLabel`. `required` continua repassado ao controle para validação nativa e leitores de tela. Use-o diretamente só para controles próprios, aplicando `fieldControlClass` no controle para manter o mesmo visual. Atenção: pickers nativos (ex.: o calendário de `type="date"`) são do navegador e não seguem os tokens.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FormField>;

export const CustomControl: Story = {
  render: () => (
    <FormField label="Horário" helperText="Formato 24h" required>
      {(control) => <input type="time" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Horário" error="Informe um horário válido.">
      {(control) => <input type="time" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

/** Só os campos opcionais são marcados. O texto do marcador vem de `optionalLabel` (i18n). */
export const Optional: Story = {
  render: () => (
    <FormField label="Complemento" helperText="Apartamento, bloco, sala…" optional>
      {(control) => <input type="text" autoComplete="address-line2" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

/** `labelAction`: ação ao lado do rótulo (fora do `<label>`), como um botão de ajuda. */
export const WithLabelAction: Story = {
  render: () => (
    <FormField
      label="Código do pedido"
      labelAction={
        <Button variant="ghost" size="sm" iconOnly aria-label="Onde encontro o código do pedido?" iconLeft={<CircleQuestionMark size={16} />} />
      }
    >
      {(control) => <input type="text" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

/** `size="sm"`: rótulo menor e espaçamento reduzido, para filtros de tabela. */
export const Compact: Story = {
  render: () => (
    <FormField label="Filtrar por cidade" size="sm" optional>
      {(control) => <input type="text" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

/** Somente leitura: mantém a aparência de campo com fundo diferenciado. */
export const ReadOnly: Story = {
  render: () => (
    <FormField label="Identificador" helperText="Gerado automaticamente.">
      {(control) => <input type="text" readOnly value="PED-2026-0042" className={fieldControlClass} {...control} />}
    </FormField>
  ),
};

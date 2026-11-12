import type { Meta, StoryObj } from '@storybook/react';

const text: React.CSSProperties = { fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', margin: 0 };
const box: React.CSSProperties = {
  border: 'var(--border-width-thin) solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-card)',
  background: 'var(--color-bg-surface)',
};
const items = ['Relatório mensal', 'Contrato assinado', 'Nota fiscal', 'Proposta comercial', 'Ata de reunião', 'Planilha de custos', 'Orçamento', 'Recibo'];

/** Padrão global de barra de rolagem: aplicado a todo elemento com rolagem via tokens.css. */
const ScrollbarStory = () => (
  <div style={{ padding: 'var(--spacing-xl)', maxWidth: 'calc(var(--spacing-3xl) * 10)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)' }}>Scrollbar</h2>
      <p style={text}>
        Fina (`--scrollbar-thickness`, 4px neste projeto) e neutra (`--scrollbar-thumb`). A faixa transparente em volta
        também recebe clique e arraste: 24px nos dois eixos (`--scrollbar-size-x` e `--scrollbar-size-y`, ajustados em
        `src/tokens/overrides.css`). Vale para qualquer elemento, sem configuração por
        componente. No Firefox, usa a barra fina nativa.
      </p>
    </div>

    <div style={{ ...box, overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', width: 'max-content' }}>
        {items.concat(items).map((k, i) => (
          <span key={i} style={{ ...text, whiteSpace: 'nowrap' }}>{k} {String(i + 1).padStart(2, '0')}</span>
        ))}
      </div>
    </div>

    <div style={{ ...box, overflowY: 'auto', height: 'calc(var(--spacing-3xl) * 2.5)', padding: 'var(--spacing-md)' }}>
      {items.concat(items).map((k, i) => <p key={i} style={{ ...text, padding: 'var(--spacing-xs) 0' }}>{k} {String(i + 1).padStart(2, '0')}</p>)}
    </div>
  </div>
);

const meta: Meta = { title: 'Foundations/Scrollbar', parameters: { layout: 'fullscreen' } };
export default meta;
export const Default: StoryObj = { render: () => <ScrollbarStory /> };

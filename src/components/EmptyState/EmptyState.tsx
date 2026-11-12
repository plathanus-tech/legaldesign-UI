import { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Ícone decorativo (ex.: `<Inbox size={32} />`). */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Ação principal (ex.: `<Button>Criar item</Button>`). */
  action?: ReactNode;
  /** Nível do heading do título (1–6; use 1 só quando o estado vazio é o conteúdo principal da página). Ajuste conforme a hierarquia da tela onde o EmptyState é usado. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Versão compacta (menos espaço vertical): para cartões pequenos e telas de celular, onde o estado vazio não deve dominar a página. */
  compact?: boolean;
}

/** Estado vazio de lista/seção: explica por que não há dados e oferece o próximo passo. */
export function EmptyState({ icon, title, description, action, headingLevel = 3, compact = false }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cx(styles.empty, compact && styles.compact)}>
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

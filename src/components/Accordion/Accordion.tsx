import { ReactNode, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Accordion.module.css';

export interface AccordionItem {
  title: string;
  /** Ícone decorativo antes do título (ex.: o ícone do assunto). */
  icon?: ReactNode;
  content: ReactNode;
  /** Texto de apoio sob o título (descreve o conteúdo do item). */
  subtitle?: string;
  /** Texto de apoio quando o item está recolhido (ex.: resumo do conteúdo). Sem ele, usa `subtitle`. */
  collapsedSubtitle?: string;
  /** Informação secundária à direita do cabeçalho, antes do chevron (ex.: “2 anexos”). Menor e em cor de apoio. */
  meta?: ReactNode;
  /** Informação à esquerda do `meta`, só com o item recolhido (ex.: um badge com o resultado que, aberto, já aparece no conteúdo). */
  collapsedMeta?: ReactNode;
  /** Com o item aberto, aproxima o conteúdo do título (8px em vez de 16px): para quando o conteúdo começa com um texto de apoio. */
  tightContent?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Permite vários itens abertos ao mesmo tempo. */
  allowMultiple?: boolean;
  defaultOpenIndex?: number[];
  /** Itens abertos, quando quem usa controla a abertura (ex.: para abrir um item por fora). Sem isso, o componente guarda o estado. */
  value?: number[];
  /** Avisa os itens que ficaram abertos depois de um clique (use com `value`). */
  onValueChange?: (abertos: number[]) => void;
  /** Nível do heading que envolve cada título (2–6), para manter a hierarquia da página. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * `cards` (padrão): cada item é uma caixa com borda e sombra. `lines`: só linhas divisórias, sem caixa nem
   * fundo, para usar sobre superfícies brancas (ex.: dentro de um `Dialog`), onde caixas ficariam branco sobre branco.
   */
  variant?: 'cards' | 'lines';
}

export function Accordion({ items, allowMultiple = false, defaultOpenIndex = [], value, onValueChange, headingLevel = 3, variant = 'cards' }: AccordionProps) {
  const [aberturaInterna, setAberturaInterna] = useState<Set<number>>(new Set(defaultOpenIndex));
  const openIndexes = value ? new Set(value) : aberturaInterna;
  const baseId = useId();
  const Heading = `h${headingLevel}` as const;

  const toggle = (i: number) => {
    const next = new Set(openIndexes);
    if (next.has(i)) { next.delete(i); }
    else {
      if (!allowMultiple) next.clear();
      next.add(i);
    }
    if (!value) setAberturaInterna(next);
    onValueChange?.([...next]);
  };

  return (
    <div className={cx(styles.accordion, variant === 'lines' && styles.lines)}>
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i);
        const subtitle = isOpen ? item.subtitle : item.collapsedSubtitle ?? item.subtitle;
        return (
          <div key={i} className={cx(styles.item, isOpen && styles.open, item.tightContent && styles.tight)}>
            <Heading className={styles.heading}>
              <button
                id={`${baseId}-trigger-${i}`}
                className={styles.trigger}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${i}`}
                type="button"
              >
                <span className={styles.heads}>
                  <span className={styles.titleRow}>{item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}<span>{item.title}</span></span>
                  {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
                </span>
                <span className={styles.end}>
                  {(item.meta || (!isOpen && item.collapsedMeta)) && (
                    <span className={styles.meta}>{!isOpen && item.collapsedMeta}{item.meta}</span>
                  )}
                  <span className={styles.chevron} aria-hidden="true"><ChevronDown size={16} /></span>
                </span>
              </button>
            </Heading>
            <div
              id={`${baseId}-panel-${i}`}
              role="region"
              aria-labelledby={`${baseId}-trigger-${i}`}
              className={styles.panel}
            >
              <div className={styles.panelInner}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

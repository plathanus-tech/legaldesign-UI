import { KeyboardEvent, ReactNode, RefObject, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { FormField } from '../FormField/FormField';
import { cx } from '../../utils/cx';
import { useFloatingMenu } from './useFloatingMenu';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  /** Nome da opção (exibido e usado na busca). */
  label: string;
  value: string;
  /** Informação secundária sob o nome (ex.: categoria · código). */
  description?: string;
  /** Elemento à esquerda (ex.: miniatura). Use `var(--option-leading-size)` para acompanhar o tamanho: maior na lista, menor no campo. */
  leading?: ReactNode;
  /** Texto extra considerado na busca (a busca já usa `label` e `description`). */
  keywords?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Rótulo visível (recomendado). Sem ele, passe `aria-label`. */
  label?: string;
  /** Ação ao lado do rótulo (ex.: botão de ajuda). Fica fora do `<label>`. */
  labelAction?: ReactNode;
  'aria-label'?: string;
  /** Texto de ajuda exibido abaixo do campo. */
  helperText?: string;
  /** Mensagem de erro. Marca o campo como inválido (`aria-invalid`). */
  error?: string;
  /** Repassa `required` ao campo (sem marcação visual: obrigatório é o padrão). */
  required?: boolean;
  /** Campo opcional: mostra “(opcional)” ao lado do rótulo. */
  optional?: boolean;
  /** Texto do marcador de campo opcional (i18n). */
  optionalLabel?: string;
  className?: string;
  /** `sm`: campo compacto de 36px (área de toque de 44px mantida) com texto Body/S, para filtros de tabela. Formulários usam o padrão (`md`). */
  size?: 'md' | 'sm';
  /** Mostra um campo de busca no topo da lista (filtra por nome, descrição e palavras-chave, ignorando acentos). */
  searchable?: boolean;
  /** Placeholder do campo de busca. */
  searchPlaceholder?: string;
  /** Nome acessível do campo de busca. */
  searchLabel?: string;
  /** Texto quando a busca não encontra nada (ou a lista está vazia). */
  emptyText?: string;
  /** Ícone decorativo acima do texto de lista vazia (padrão dos estados vazios). */
  emptyIcon?: ReactNode;
  /** Ação contextual (ex.: link) abaixo do texto de lista vazia; fecha o menu ao ser acionada. */
  emptyAction?: ReactNode;
  /**
   * Conteúdo fixo no campo no lugar do valor escolhido (ex.: ícone + “Ordenar por”), para controles estreitos
   * em que o valor ficaria truncado. A opção marcada continua destacada na lista; informe o valor atual no `aria-label`.
   */
  summary?: ReactNode;
}

/**
 * Seleção de uma opção em lista (padrão ARIA select-only combobox, com teclado).
 * O menu é renderizado em portal com posição fixa (não é cortado dentro de `Dialog`/`Card`): abre abaixo do
 * campo, ou acima se faltar espaço. Em telas pequenas (≤ 640px) abre como folha inferior com fundo escurecido,
 * trava o scroll da página e usa itens maiores para o toque.
 */
export function Dropdown({
  options, value, onChange, placeholder = 'Selecione...', disabled = false,
  label, labelAction, 'aria-label': ariaLabel, helperText, error, required, optional, optionalLabel, className, size = 'md',
  searchable = false, searchPlaceholder = 'Buscar', searchLabel = 'Buscar na lista', emptyText = 'Nenhum resultado',
  emptyIcon, emptyAction, summary,
}: DropdownProps) {
  if (import.meta.env.DEV && !label && !ariaLabel) {
    console.warn('Dropdown: forneça `label` ou `aria-label` para que o campo tenha um nome acessível.');
  }
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const { style: menuStyle, placement } = useFloatingMenu(open, ref, menuRef, () => setOpen(false));

  const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = norm(query.trim());
  const visible = searchable && q
    ? options.filter(o => norm(`${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`).includes(q))
    : options;
  const selected = options.find(o => o.value === value);

  // Mantém a opção ativa visível ao navegar por teclado.
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  // Com busca, o foco vai para o campo de busca ao abrir.
  useEffect(() => {
    if (!open || !searchable) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, searchable]);
  // Ao filtrar, a primeira opção vira a ativa.
  useEffect(() => { if (open && searchable) setActive(visible.length ? 0 : -1); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const openMenu = () => {
    setQuery('');
    setActive(Math.max(options.findIndex(o => o.value === value), 0));
    setOpen(true);
  };
  /** Fecha o menu; com busca o foco estava no menu, então volta ao campo. */
  const close = (restoreFocus = false) => { setOpen(false); if (restoreFocus) triggerRef.current?.focus(); };
  const commit = (i: number) => {
    const opt = visible[i];
    if (opt) onChange?.(opt.value);
    close(searchable);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const last = visible.length - 1;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); open ? setActive(i => Math.min(i + 1, last)) : openMenu(); break;
      case 'ArrowUp':   e.preventDefault(); open ? setActive(i => Math.max(i - 1, 0)) : openMenu(); break;
      case 'Home':      if (open && !searchable) { e.preventDefault(); setActive(0); } break;
      case 'End':       if (open && !searchable) { e.preventDefault(); setActive(last); } break;
      case 'Enter':     e.preventDefault(); open ? commit(active) : openMenu(); break;
      case ' ':
        if (e.target instanceof HTMLInputElement) break;   // espaço digitado na busca
        e.preventDefault(); open ? commit(active) : openMenu(); break;
      case 'Escape':    if (open) { e.preventDefault(); e.stopPropagation(); close(searchable); } break;
      // Com busca, o foco volta ao campo antes do Tab seguir para o próximo elemento da página.
      case 'Tab':       if (open) close(searchable); break;
    }
  };

  const emptyContent = (
    <>
      {emptyIcon && <span className={styles.emptyIcon} aria-hidden="true">{emptyIcon}</span>}
      {emptyText}
      {emptyAction && <span className={styles.emptyAction} onClick={() => setOpen(false)}>{emptyAction}</span>}
    </>
  );

  const items = visible.map((opt, i) => (
    <li
      key={opt.value}
      id={`${listId}-${i}`}
      role="option"
      aria-selected={opt.value === value}
      data-active={i === active}
      className={styles.option}
      onMouseEnter={() => setActive(i)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => commit(i)}
    >
      {opt.leading && <span className={styles.optionLeading} aria-hidden="true">{opt.leading}</span>}
      <span className={styles.optionText}>
        <span>{opt.label}</span>
        {opt.description && <span className={styles.optionDesc}>{opt.description}</span>}
      </span>
    </li>
  ));

  return (
    <FormField
      label={label} labelAction={labelAction} helperText={helperText} error={error} required={required}
      optional={optional} optionalLabel={optionalLabel} className={className} size={size}
    >
      {(control) => (
        <div ref={ref} className={cx(styles.anchor, open && styles.open)}>
          <button
            {...control}
            ref={triggerRef}
            type="button"
            role="combobox"
            className={cx(styles.trigger, size === 'sm' && styles.triggerSm)}
            disabled={disabled}
            aria-label={label ? undefined : ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open && !searchable && active >= 0 ? `${listId}-${active}` : undefined}
            onClick={() => (open ? setOpen(false) : openMenu())}
            onKeyDown={onKeyDown}
          >
            {summary ? (
              <span className={styles.value}>{summary}</span>
            ) : selected ? (
              <span className={styles.value}>
                {selected.leading && <span className={styles.triggerLeading} aria-hidden="true">{selected.leading}</span>}
                <span className={styles.valueText}>
                  <span className={styles.valueLabel}>{selected.label}</span>
                  {selected.description && <span className={styles.valueDesc}>{selected.description}</span>}
                </span>
              </span>
            ) : <span className={styles.placeholder}>{placeholder}</span>}
            <span className={styles.chevron} aria-hidden="true"><ChevronDown size={16} /></span>
          </button>
          {open && createPortal(
            <>
              <div className={styles.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />
              {searchable ? (
                <div
                  ref={menuRef as RefObject<HTMLDivElement>}
                  data-placement={placement}
                  className={cx(styles.menu, styles.menuSearchable)}
                  style={menuStyle}
                >
                  <div className={styles.search}>
                    <Search size={16} aria-hidden="true" className={styles.searchIcon} />
                    <input
                      ref={searchRef} type="search" className={styles.searchInput}
                      placeholder={searchPlaceholder} aria-label={searchLabel} autoComplete="off"
                      aria-controls={listId}
                      aria-activedescendant={active >= 0 && visible.length ? `${listId}-${active}` : undefined}
                      value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
                    />
                  </div>
                  <ul id={listId} role="listbox" aria-label={label ?? ariaLabel} className={styles.list}>{items}</ul>
                  {visible.length === 0 && <p className={styles.empty} role="status">{emptyContent}</p>}
                </div>
              ) : (
                <ul
                  ref={menuRef as RefObject<HTMLUListElement>}
                  id={listId} role="listbox" aria-label={label ?? ariaLabel}
                  data-placement={placement}
                  className={styles.menu}
                  style={menuStyle}
                >
                  {items}
                  {visible.length === 0 && <li role="presentation" className={styles.empty}>{emptyContent}</li>}
                </ul>
              )}
            </>,
            document.body,
          )}
        </div>
      )}
    </FormField>
  );
}

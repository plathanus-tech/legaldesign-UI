import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { FormField } from '../FormField/FormField';
import { Checkbox } from '../Checkbox/Checkbox';
import { cx } from '../../utils/cx';
import type { DropdownOption } from '../Dropdown/Dropdown';
import { useFloatingMenu } from '../Dropdown/useFloatingMenu';
import menu from '../Dropdown/Dropdown.module.css';
import styles from './MultiSelect.module.css';

export interface MultiSelectProps {
  /** Opções disponíveis (mesmo formato do `Dropdown`; `description` aparece sob o nome). */
  options: DropdownOption[];
  /** Valores selecionados. */
  value: string[];
  onChange: (value: string[]) => void;
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
  /** Nome acessível do botão de remover de cada tag (i18n). Padrão: “Remover {rótulo}”. */
  removeLabel?: (optionLabel: string) => string;
  /** Texto quando não há opções disponíveis (mesmo padrão do Dropdown). */
  emptyText?: string;
  /** Ícone decorativo acima do texto de lista vazia. */
  emptyIcon?: ReactNode;
  /** Ação contextual (ex.: link) abaixo do texto vazio; fecha o menu ao ser acionada. */
  emptyAction?: ReactNode;
}

/**
 * Seleção de várias opções: o menu (checkboxes) continua aberto a cada escolha e as selecionadas aparecem como tags
 * removíveis dentro do campo, que cresce em altura quando elas quebram de linha. Mesmo visual, posicionamento
 * (portal, abre para cima se faltar espaço, folha inferior no mobile) e teclado do Dropdown.
 */
export function MultiSelect({
  options, value, onChange, placeholder = 'Selecione', disabled = false, label, labelAction, 'aria-label': ariaLabel,
  helperText, error, required, optional, optionalLabel, className, removeLabel = (l) => `Remover ${l}`,
  emptyText = 'Nenhum resultado', emptyIcon, emptyAction,
}: MultiSelectProps) {
  if (import.meta.env.DEV && !label && !ariaLabel) {
    console.warn('MultiSelect: forneça `label` ou `aria-label` para que o campo tenha um nome acessível.');
  }
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.filter((o) => value.includes(o.value));
  // Reposiciona quando o campo cresce com as tags.
  const { style: menuStyle, placement } = useFloatingMenu(open, ref, menuRef, () => setOpen(false), [value.length]);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  const openMenu = () => { setActive(0); setOpen(true); };
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const remove = (e: MouseEvent, v: string) => { e.stopPropagation(); onChange(value.filter((x) => x !== v)); };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;   // teclas dos botões de remover não abrem/fecham o menu
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); open ? setActive((i) => Math.min(i + 1, last)) : openMenu(); break;
      case 'ArrowUp':   e.preventDefault(); open ? setActive((i) => Math.max(i - 1, 0)) : openMenu(); break;
      case 'Home':      if (open) { e.preventDefault(); setActive(0); } break;
      case 'End':       if (open) { e.preventDefault(); setActive(last); } break;
      case 'Enter':
      case ' ':         e.preventDefault(); if (!open) openMenu(); else if (options[active]) toggle(options[active].value); break;
      case 'Escape':    if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false); } break;
      case 'Tab':       setOpen(false); break;
    }
  };

  return (
    <FormField
      label={label} labelAction={labelAction} helperText={helperText} error={error} required={required}
      optional={optional} optionalLabel={optionalLabel} className={className}
    >
      {(control) => (
        <div ref={ref} className={cx(menu.anchor, open && styles.open)}>
          <div
            {...control}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            className={styles.trigger}
            aria-label={label ? undefined : ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-disabled={disabled || undefined}
            onClick={() => { if (!disabled) { if (open) setOpen(false); else openMenu(); } }}
            onKeyDown={onKeyDown}
          >
            <span className={styles.values}>
              {selected.length === 0 && <span className={styles.placeholder}>{placeholder}</span>}
              {selected.map((o) => (
                <span key={o.value} className={styles.tag}>
                  <span className={styles.tagLabel}>{o.label}</span>
                  {!disabled && (
                    <button type="button" className={styles.tagRemove} aria-label={removeLabel(o.label)} onClick={(e) => remove(e, o.value)}>
                      <X size={12} aria-hidden="true" />
                    </button>
                  )}
                </span>
              ))}
            </span>
            <span className={styles.chevron} aria-hidden="true"><ChevronDown size={16} /></span>
          </div>
          {open && createPortal(
            <>
              <div className={menu.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />
              <ul
                ref={menuRef} id={listId} role="listbox" aria-multiselectable="true" aria-label={label ?? ariaLabel}
                data-placement={placement} className={menu.menu} style={menuStyle}
              >
                {options.map((opt, i) => {
                  const on = value.includes(opt.value);
                  return (
                    <li
                      key={opt.value} id={`${listId}-${i}`} role="option" aria-selected={on} data-active={i === active}
                      className={cx(menu.option, styles.option)}
                      onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => toggle(opt.value)}
                    >
                      <span className={styles.optionCheck} aria-hidden="true">
                        <Checkbox checked={on} readOnly tabIndex={-1} aria-hidden="true" />
                      </span>
                      <span className={menu.optionText}>
                        <span>{opt.label}</span>
                        {opt.description && <span className={menu.optionDesc}>{opt.description}</span>}
                      </span>
                    </li>
                  );
                })}
                {options.length === 0 && (
                  <li role="presentation" className={menu.empty}>
                    {emptyIcon && <span className={menu.emptyIcon} aria-hidden="true">{emptyIcon}</span>}
                    {emptyText}
                    {emptyAction && <span className={menu.emptyAction} onClick={() => setOpen(false)}>{emptyAction}</span>}
                  </li>
                )}
              </ul>
            </>,
            document.body,
          )}
        </div>
      )}
    </FormField>
  );
}

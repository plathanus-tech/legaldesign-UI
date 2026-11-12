import { InputHTMLAttributes, ReactNode, useEffect, useId, useRef } from 'react';
import { Check, Minus, CircleX } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Rótulo visível (texto ou conteúdo com links/botões, que não alternam o campo ao serem acionados). Sem `label`, passe `aria-label`. */
  label?: ReactNode;
  checked?: boolean;
  /** Estado misto (ex.: "selecionar todos" com seleção parcial). */
  indeterminate?: boolean;
  /** Mensagem de erro. Marca o campo como inválido (`aria-invalid`), no mesmo padrão visual do Input. */
  error?: string;
}

export function Checkbox({ label, checked = false, indeterminate = false, disabled = false, error, id, ...props }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const errorId = `${id ?? autoId}-error`;
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);

  return (
    <div className={styles.field}>
      <label className={cx(styles.wrapper, checked && styles.checked, indeterminate && styles.indeterminate, disabled && styles.disabled)}>
        <input
          ref={ref} id={id} type="checkbox" className={styles.input} checked={checked} disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        <span className={styles.box} aria-hidden="true">
          {indeterminate
            ? <span className={styles.mark}><Minus size={12} strokeWidth={3} /></span>
            : checked ? <span className={styles.mark}><Check size={12} strokeWidth={3} /></span> : null}
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
      {error && (
        <span id={errorId} className={styles.error} aria-live="polite">
          <CircleX size={14} className={styles.msgIcon} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

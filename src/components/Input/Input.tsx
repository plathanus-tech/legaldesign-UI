import { InputHTMLAttributes, ReactNode } from 'react';
import { FormField } from '../FormField/FormField';
import { cx } from '../../utils/cx';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visível. Sem `label`, passe `aria-label` para manter o campo acessível. */
  label?: string;
  /** Ação ao lado do rótulo (ex.: botão de ajuda). Fica fora do `<label>`. */
  labelAction?: ReactNode;
  /** Campo opcional: mostra “(opcional)” ao lado do rótulo (os obrigatórios não levam marcação). */
  optional?: boolean;
  /** Texto do marcador de campo opcional (i18n). */
  optionalLabel?: string;
  /** Densidade do rótulo (ver `FormField`): `sm` para filtros de tabela. Não confundir com o atributo nativo `size`. */
  fieldSize?: 'md' | 'sm';
  /** Texto de ajuda exibido abaixo do campo. */
  helperText?: string;
  /** Mensagem de erro. Marca o campo como inválido (`aria-invalid`). */
  error?: string;
  /** Mensagem de sucesso (ignorada se houver `error`). */
  success?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /**
   * Torna `iconRight` um botão clicável em vez de um ícone decorativo — use para ações como
   * mostrar/ocultar senha. Exige `iconRightLabel` para o botão ter nome acessível.
   */
  onIconRightClick?: () => void;
  /** Nome acessível do botão de `iconRight` (obrigatório quando `onIconRightClick` é usado). */
  iconRightLabel?: string;
  /** Estado de alternância do botão de `iconRight` (`aria-pressed`), ex.: senha visível. Omita em ações simples. */
  iconRightPressed?: boolean;
  /** Oculta o ícone da mensagem de erro. Útil quando o indicador
   *  visual de erro é fornecido por outro elemento (ex: Feedback block). */
  hideErrorIcon?: boolean;
}

export function Input({
  label, helperText, error, success, iconLeft, iconRight, onIconRightClick, iconRightLabel, iconRightPressed,
  hideErrorIcon, className, id, required, optional, optionalLabel, labelAction, fieldSize, ...props
}: InputProps) {
  if (import.meta.env.DEV && !label && !props['aria-label'] && !props['aria-labelledby']) {
    console.warn('Input: forneça `label` ou `aria-label` para que o campo tenha um nome acessível.');
  }
  if (import.meta.env.DEV && onIconRightClick && !iconRightLabel) {
    console.warn('Input: forneça `iconRightLabel` para que o botão de `iconRight` tenha um nome acessível.');
  }
  return (
    <FormField
      label={label} helperText={helperText} error={error} success={success}
      required={required} optional={optional} optionalLabel={optionalLabel} labelAction={labelAction}
      size={fieldSize} hideErrorIcon={hideErrorIcon} id={id} className={className}
    >
      {(control) => (
        <div className={cx(styles.inputWrap, Boolean(iconLeft) && styles.hasLeft, Boolean(iconRight) && styles.hasRight)}>
          {iconLeft && <span className={styles.iconLeft} aria-hidden="true">{iconLeft}</span>}
          <input className={styles.input} {...control} {...props} />
          {iconRight && (
            onIconRightClick ? (
              <button type="button" className={styles.iconRightBtn} onClick={onIconRightClick}
                aria-label={iconRightLabel} aria-pressed={iconRightPressed} disabled={props.disabled}
              >
                {iconRight}
              </button>
            ) : (
              <span className={styles.iconRight} aria-hidden="true">{iconRight}</span>
            )
          )}
        </div>
      )}
    </FormField>
  );
}

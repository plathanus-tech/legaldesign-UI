import { ReactNode, TextareaHTMLAttributes } from 'react';
import { FormField } from '../FormField/FormField';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rótulo visível. Sem `label`, passe `aria-label`. */
  label?: string;
  /** Ação ao lado do rótulo (ex.: botão de ajuda). Fica fora do `<label>`. */
  labelAction?: ReactNode;
  /** Campo opcional: mostra “(opcional)” ao lado do rótulo (os obrigatórios não levam marcação). */
  optional?: boolean;
  /** Texto do marcador de campo opcional (i18n). */
  optionalLabel?: string;
  /** Texto de ajuda exibido abaixo do campo. */
  helperText?: string;
  /** Mensagem de erro. Marca o campo como inválido (`aria-invalid`). */
  error?: string;
  /** Mensagem de sucesso (ignorada se houver `error`). */
  success?: string;
}

/** Campo de texto multilinha (comentários, descrições, mensagens). */
export function Textarea({ label, helperText, error, success, className, id, required, optional, optionalLabel, labelAction, rows = 4, ...props }: TextareaProps) {
  if (import.meta.env.DEV && !label && !props['aria-label'] && !props['aria-labelledby']) {
    console.warn('Textarea: forneça `label` ou `aria-label` para que o campo tenha um nome acessível.');
  }
  return (
    <FormField label={label} helperText={helperText} error={error} success={success} required={required} optional={optional}
      optionalLabel={optionalLabel} labelAction={labelAction} id={id} className={className}>
      {(control) => <textarea className={styles.textarea} rows={rows} {...control} {...props} />}
    </FormField>
  );
}

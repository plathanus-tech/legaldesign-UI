import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Feedback.module.css';

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

export interface FeedbackLink {
  /** Texto visível do link (ex.: "Falar com o suporte"). */
  label: string;
  /** Destino. Com `href` o link é renderizado como `<a>`. */
  href?: string;
  /** Ação ao clicar. Só com `onClick` (sem `href`) é renderizado como `<button>`. */
  onClick?: () => void;
}

export interface FeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  /** Texto da mensagem. Aceita um trecho em destaque (por exemplo, uma data em negrito). */
  message: ReactNode;
  title?: string;
  /** Ícone no lugar do padrão do tipo (por exemplo, um relógio em um aviso de prazo). Use um ícone de 18px. */
  icon?: ReactNode;
  /** Link de ação dentro da mensagem, logo abaixo do texto (ex.: "Falar com o suporte").
   *  Com `href` é um `<a>`; só com `onClick`, um botão. Sublinhado (não depende só da cor). */
  link?: FeedbackLink;
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Rótulo do botão de fechar (i18n). */
  dismissLabel?: string;
  /** Por padrão: `alert` para error/warning (interrompe) e `status` para success/info (educado). */
  role?: 'alert' | 'status';
}

/** Mensagem de status inline (banner). Para confirmações efêmeras use `Toast`. */
export function Feedback({ type, message, title, icon, link, dismissible, onDismiss, dismissLabel = 'Fechar', role }: FeedbackProps) {
  const liveRole = role ?? (type === 'error' || type === 'warning' ? 'alert' : 'status');
  return (
    <div className={cx(styles.alert, styles[type])} role={liveRole}>
      <span className={styles.icon} aria-hidden="true">{icon ?? ICONS[type]}</span>
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
        {link && (link.href
          ? <a className={styles.link} href={link.href} onClick={link.onClick}>{link.label}</a>
          : <button className={styles.link} type="button" onClick={link.onClick}>{link.label}</button>)}
      </div>
      {dismissible && (
        <button className={styles.dismiss} onClick={onDismiss} aria-label={dismissLabel} type="button">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

import { CSSProperties, ReactNode, RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import styles from './Popover.module.css';

export interface PopoverProps {
  /** Controla a visibilidade do painel. */
  open: boolean;
  /** Chamado ao pressionar Esc ou clicar fora (o foco volta ao botão no Esc). */
  onClose: () => void;
  /** Elemento que abre o popover (botão). O painel se posiciona sob ele e cliques nele não contam como "fora". */
  anchorRef: RefObject<HTMLElement>;
  /** Nome acessível do painel. */
  label: string;
  /** Alinhamento da borda do painel com a do botão. */
  align?: 'start' | 'end';
  /** Menu de ações curto: no mobile o painel se ajusta ao conteúdo (em vez da largura padrão) e fica dentro da margem da tela. */
  fit?: boolean;
  children: ReactNode;
}

/** Há um campo com menu próprio (Dropdown, MultiSelect, DatePicker) aberto dentro do painel? */
const hasOpenMenu = (panel: HTMLElement | null) => Boolean(panel?.querySelector('[aria-expanded="true"]'));

/**
 * Painel flutuante ancorado a um botão, para controles de apoio (ex.: filtros de uma tabela). Renderiza em um portal
 * (não é cortado por overflow), fecha com Esc e ao clicar fora, e devolve o foco ao botão. Campos com menu próprio
 * (Dropdown, MultiSelect, DatePicker) funcionam dentro dele: enquanto um menu do painel está aberto, o clique fora e
 * o Esc fecham só esse menu. Para conteúdo que exige decisão ou foco preso, use `Dialog`.
 */
export function Popover({ open, onClose, anchorRef, label, align = 'end', fit = false, children }: PopoverProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      // o painel nunca passa da borda da tela (no mobile, com o botão perto de uma das bordas)
      const vw = document.documentElement.clientWidth;
      const largura = panelRef.current?.offsetWidth ?? 0;
      const margem = 16;
      const segura = (x: number) => Math.max(margem, Math.min(x, vw - largura - margem));
      setStyle({ top: r.bottom + 4, ...(align === 'end' ? { right: vw - segura(r.right - largura) - largura } : { left: segura(r.left) }) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, align, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const close = (restoreFocus: boolean) => {
      onCloseRef.current();
      if (restoreFocus) (anchorRef.current?.querySelector<HTMLElement>('button, [href], input') ?? anchorRef.current)?.focus();
    };
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      if (hasOpenMenu(panelRef.current)) return; // o clique é do menu aberto (em portal), que se fecha sozinho
      close(false);
    };
    const key = (e: KeyboardEvent) => {
      // Esc já tratado por um menu interno (Dropdown/MultiSelect chamam preventDefault) ou menu ainda aberto: não fecha o painel
      if (e.key !== 'Escape' || e.defaultPrevented || hasOpenMenu(panelRef.current)) return;
      e.stopPropagation();
      close(true);
    };
    document.addEventListener('mousedown', down, true);
    document.addEventListener('keydown', key);
    panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    return () => { document.removeEventListener('mousedown', down, true); document.removeEventListener('keydown', key); };
  }, [open, anchorRef]);

  if (!open) return null;
  return createPortal(
    <div ref={panelRef} id={id} role="dialog" aria-label={label} className={cx(styles.panel, fit && styles.fit)} style={style}>
      {children}
    </div>,
    document.body,
  );
}

import { CSSProperties, DependencyList, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Igual a `--breakpoint-sm` (media queries e matchMedia não aceitam var()). */
export const MOBILE_QUERY = '(max-width: 640px)';
/** Altura aproximada do menu (15rem + folga) usada para decidir se abre para cima. */
const MENU_SPACE = 260;
/** Distância entre campo e menu, e margem mínima até a borda da tela. */
const GAP = 4;
const EDGE = 16;

export interface FloatingMenu {
  /** Estilo inline do menu (posição fixa). `undefined` na folha mobile, posicionada só por CSS. */
  style?: CSSProperties;
  /** `bottom`/`top` no desktop; `sheet` em telas pequenas (folha inferior com fundo escurecido). */
  placement: 'bottom' | 'top' | 'sheet';
}

/**
 * Posiciona um menu renderizado em portal (`position: fixed`) colado ao campo: abaixo, ou acima se faltar
 * espaço; em telas ≤ 640px vira folha inferior (sem estilo inline) e trava o scroll do fundo. Também fecha
 * ao clicar fora do campo e do menu. Compartilhado por `Dropdown` e `MultiSelect`.
 */
export function useFloatingMenu(
  open: boolean,
  anchorRef: RefObject<HTMLElement>,
  menuRef: RefObject<HTMLElement>,
  onClose: () => void,
  deps: DependencyList = [],
): FloatingMenu {
  const [menu, setMenu] = useState<FloatingMenu>({ placement: 'bottom' });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Fecha ao clicar fora (na folha mobile, o clique no fundo escurecido também conta como fora).
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!anchorRef.current?.contains(t) && !menuRef.current?.contains(t)) onCloseRef.current();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, anchorRef, menuRef]);

  // Portal no <body> com posição fixa: não é cortado por containers com overflow (Dialog, Card).
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (window.matchMedia(MOBILE_QUERY).matches) { setMenu({ placement: 'sheet' }); return; }
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const vh = document.documentElement.clientHeight;
      const below = vh - r.bottom - EDGE;
      const above = r.top - EDGE;
      const top = below < MENU_SPACE && above > below;
      const room = Math.max(top ? above : below, 0) - GAP;
      const base: CSSProperties = { left: r.left, width: r.width, ['--menu-room' as string]: `${room}px` };
      setMenu(top
        ? { placement: 'top', style: { ...base, bottom: vh - r.top + GAP } }
        : { placement: 'bottom', style: { ...base, top: r.bottom + GAP } });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, anchorRef, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // Na folha mobile, trava o scroll do fundo enquanto está aberta.
  const sheet = open && menu.placement === 'sheet';
  useEffect(() => {
    if (!sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [sheet]);

  return menu;
}

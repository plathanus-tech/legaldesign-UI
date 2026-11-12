import type { NotaDev } from './notas';

/**
 * Coloca os marcadores das notas de desenvolvimento dentro do quadro (iframe) que mostra a tela, SEM alterar o código das telas:
 * o Navegador de Protótipo e o quadro vêm da mesma origem, então os marcadores são criados de fora, só enquanto "Ver notas" está ligado,
 * e removidos ao desligar. Os estilos usam os tokens que a própria tela já carrega.
 */
export interface MarcadorDeNota { chave: string; nota: NotaDev; local: number; alvo?: { seletor: string; texto?: string; ancestral?: string }; somenteComAlvo?: boolean }

/** Todos os pontos de nota que valem para a tela (story) aberta. */
export function marcadoresDaTela(storyId: string | undefined, notas: NotaDev[]): MarcadorDeNota[] {
  if (!storyId) return [];
  return notas.flatMap(nota => nota.locais.flatMap((l, i) => (l.telas.some(t => storyId.startsWith(t)) ? [{ chave: `${nota.id}:${i}`, nota, local: i, alvo: l.alvo, somenteComAlvo: l.somenteComAlvo }] : [])));
}

/** Notas distintas da tela (uma nota com dois pontos conta uma vez). */
export const notasDaTela = (marcadores: MarcadorDeNota[]): NotaDev[] => [...new Map(marcadores.map(m => [m.nota.id, m.nota])).values()];

const ATRIBUTO = 'data-dev-nota';
const ATRIBUTO_POSICAO = 'data-dev-posicao';

function achar(doc: Document, alvo: NonNullable<MarcadorDeNota['alvo']>): HTMLElement | null {
  const raiz = doc.querySelector('#storybook-root') ?? doc.body;
  const candidatos = [...raiz.querySelectorAll<HTMLElement>(alvo.seletor)].filter(e => !e.hasAttribute(ATRIBUTO) && (!alvo.texto || (e.textContent ?? '').includes(alvo.texto)));
  const el = candidatos[0];
  if (!el) return null;
  return alvo.ancestral ? el.closest<HTMLElement>(alvo.ancestral) ?? el : el;
}

function criar(doc: Document, m: MarcadorDeNota, ordem: number, noAlvo: boolean, onAbrir: (id: string) => void): HTMLButtonElement {
  const b = doc.createElement('button');
  b.type = 'button';
  b.setAttribute(ATRIBUTO, m.chave);
  b.setAttribute('data-dev-no-alvo', noAlvo ? '1' : '0');
  b.setAttribute('aria-label', `Nota para desenvolvimento: ${m.nota.titulo}`);
  b.title = `Nota para desenvolvimento: ${m.nota.titulo}`;
  b.textContent = 'N';
  const posicao = noAlvo
    ? 'position:absolute;top:0;right:0;'
    : `position:fixed;top:calc(var(--spacing-md) + ${ordem} * var(--spacing-xl));right:var(--spacing-md);`;
  b.style.cssText = `${posicao}z-index:2147483000;display:inline-flex;align-items:center;justify-content:center;width:var(--spacing-lg);height:var(--spacing-lg);padding:0;border-radius:var(--radius-full);border:var(--border-width-medium) dashed var(--color-status-warning-fg);background:var(--color-status-warning-bg);color:var(--color-status-warning-fg);font:var(--text-caption-m);font-weight:var(--font-weight-heading);cursor:pointer;box-shadow:var(--shadow-md);`;
  b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); onAbrir(m.nota.id); });
  return b;
}

/** Cria (ou ajusta) os marcadores. Pode rodar quantas vezes precisar: só mexe no que mudou. */
export function aplicarMarcadores(doc: Document, marcadores: MarcadorDeNota[], onAbrir: (id: string) => void): void {
  let foraDoAlvo = 0;
  for (const m of marcadores) {
    const existente = doc.querySelector<HTMLButtonElement>(`[${ATRIBUTO}="${m.chave}"]`);
    const alvo = m.alvo ? achar(doc, m.alvo) : null;
    if (alvo) {
      if (existente && existente.parentElement === alvo && existente.getAttribute('data-dev-no-alvo') === '1') continue;
      existente?.remove();
      if (getComputedStyle(alvo).position === 'static') { alvo.style.position = 'relative'; alvo.setAttribute(ATRIBUTO_POSICAO, '1'); }
      alvo.appendChild(criar(doc, m, 0, true, onAbrir));
    } else if (m.somenteComAlvo) {
      existente?.remove();
    } else {
      const ordem = foraDoAlvo++;
      if (existente && existente.getAttribute('data-dev-no-alvo') === '0' && existente.parentElement === doc.body) continue;
      existente?.remove();
      doc.body.appendChild(criar(doc, m, ordem, false, onAbrir));
    }
  }
}

/** Tira todos os marcadores e devolve o que foi mexido nas telas. */
export function removerMarcadores(doc: Document): void {
  doc.querySelectorAll(`[${ATRIBUTO}]`).forEach(e => e.remove());
  doc.querySelectorAll<HTMLElement>(`[${ATRIBUTO_POSICAO}]`).forEach(e => { e.style.position = ''; e.removeAttribute(ATRIBUTO_POSICAO); });
}

/**
 * Liga os marcadores no quadro e os mantém quando a tela se redesenha (a tela muda ao escolher uma opção, por exemplo).
 * Devolve a função que desliga tudo.
 */
export function mostrarNotasNoQuadro(frame: HTMLIFrameElement, marcadores: MarcadorDeNota[], onAbrir: (id: string) => void): () => void {
  let doc: Document | null = null;
  try { doc = frame.contentDocument; } catch { doc = null; }
  if (!doc || !doc.body) return () => undefined;
  const d = doc;
  let espera = 0;
  const rodar = () => { window.clearTimeout(espera); espera = window.setTimeout(() => aplicarMarcadores(d, marcadores, onAbrir), 150); };
  aplicarMarcadores(d, marcadores, onAbrir);
  const observador = new MutationObserver(rodar);
  observador.observe(d.body, { childList: true, subtree: true });
  return () => { window.clearTimeout(espera); observador.disconnect(); removerMarcadores(d); };
}

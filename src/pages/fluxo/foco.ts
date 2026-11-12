import { useEffect, type RefObject } from 'react';

const CHAVE_FOCO = 'legal-design.foco.v1';

/** Pede à próxima tela que leve a pessoa a um item (usado pelos links do resumo). Só no protótipo: guarda na sessão do navegador. */
export function pedirFoco(itemId?: string): void {
  try { if (itemId) sessionStorage.setItem(CHAVE_FOCO, itemId); else sessionStorage.removeItem(CHAVE_FOCO); } catch { /* sem storage */ }
}

const CHAVE_RETORNO = 'legal-design.retorno.v1';
/** Marca que a pessoa saiu de uma página para completar algo (ex.: o cônjuge) e deve poder voltar a ela. Só no protótipo (sessão do navegador). */
export function pedirRetorno(item: string): void {
  try { sessionStorage.setItem(CHAVE_RETORNO, item); } catch { /* sem storage */ }
}
/** Para onde a pessoa deve voltar (o item da página de origem), sem apagar. */
export function lerRetorno(): string | null {
  try { return sessionStorage.getItem(CHAVE_RETORNO); } catch { return null; }
}
export function limparRetorno(): void {
  try { sessionStorage.removeItem(CHAVE_RETORNO); } catch { /* sem storage */ }
}

/** Rola até o elemento marcado com `data-foco="<id>"` dentro de `raiz` e põe o foco no primeiro campo dele. */
export function irParaCampo(raiz: HTMLElement | null, id?: string): void {
  if (!raiz || !id) return;
  const alvo = raiz.querySelector<HTMLElement>(`[data-foco="${id}"]`);
  if (!alvo) return;
  alvo.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const campo = alvo.querySelector<HTMLElement>('input:checked, input:not([type=file]):not([type=radio]), button:not([disabled])');
  focarCampo(campo);
}

/** Ao abrir a tela, vai ao item pedido por outra tela (se houver). */
export function useFocoInicial(raiz: RefObject<HTMLElement>): void {
  useEffect(() => {
    let id: string | null = null;
    try { id = sessionStorage.getItem(CHAVE_FOCO); sessionStorage.removeItem(CHAVE_FOCO); } catch { /* sem storage */ }
    if (id) setTimeout(() => irParaCampo(raiz.current, id ?? undefined), 100);
  }, [raiz]);
}

const CHAVE_EDICAO = 'legal-design.edicao-resumo.v1';
/** Marca que a pessoa saiu da revisão para editar um item e deve poder voltar a ela. Só no protótipo (sessão do navegador). */
export function pedirEdicaoDoResumo(item?: string): void {
  try { if (item) sessionStorage.setItem(CHAVE_EDICAO, item); else sessionStorage.removeItem(CHAVE_EDICAO); } catch { /* sem storage */ }
}
/** O item que está sendo editado a partir da revisão (sem apagar). */
export function lerEdicaoDoResumo(): string | null {
  try { return sessionStorage.getItem(CHAVE_EDICAO); } catch { return null; }
}
export function limparEdicaoDoResumo(): void {
  try { sessionStorage.removeItem(CHAVE_EDICAO); } catch { /* sem storage */ }
}

// Como a pessoa usou a tela por último: o foco só é levado a um botão (com o anel visível) para quem navega pelo teclado
let ultimaFoiTeclado = false;
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => { if (e.key !== 'Shift') ultimaFoiTeclado = true; }, true);
  window.addEventListener('pointerdown', () => { ultimaFoiTeclado = false; }, true);
}
/** Foco programático só quando a última interação foi pelo teclado; com mouse ou toque, só rola até o elemento. */
export function focarSeTeclado(el?: HTMLElement | null): void {
  if (el && ultimaFoiTeclado) el.focus({ preventScroll: true });
}
/** Botões, opções e caixas de marcar só recebem foco programático para quem usa o teclado; campos de digitar sempre recebem (a pessoa vai escrever). */
export function focarCampo(el?: HTMLElement | null): void {
  if (!el) return;
  const semDigitar = el instanceof HTMLButtonElement || (el instanceof HTMLInputElement && ['radio', 'checkbox'].includes(el.type));
  if (semDigitar) focarSeTeclado(el); else el.focus({ preventScroll: true });
}

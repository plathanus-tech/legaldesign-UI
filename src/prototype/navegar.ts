import { pedirEdicaoDoResumo, pedirFoco } from '../pages/fluxo/foco';
import { paginaDoItem, type PaginaId } from '../pages/fluxo/resumo';

/**
 * Navegação entre telas do protótipo (só para o Storybook; no produto real isso é o roteador).
 * Dentro do Navegador de Protótipo, avisa o navegador (a janela de fora) para trocar de tela, e a barra lateral
 * acompanha. Fora dele, abre a story direto.
 */
export const TELAS = {
  inicio: 'telas-0-apresentação--padrao',
  tipoDeLocacao: 'telas-1-1-tipo-de-locação-e-de-imóvel--padrao',
  dono: 'telas-1-2-dono-do-imóvel--padrao',
  administracao: 'telas-1-3-quem-administra-o-aluguel--padrao',
  inquilino: 'telas-1-4-quem-vai-alugar--padrao',
  imovel: 'telas-1-5-dados-do-imóvel--padrao',
  valores: 'telas-1-6-valores-e-pagamento--padrao',
  convivencia: 'telas-1-7-usar-e-conviver--padrao',
  reparos: 'telas-1-8-reparos-obras-e-benfeitorias--padrao',
  saida: 'telas-1-9-saída-garantias-e-penalidades--padrao',
  resumo: 'telas-2-1-resumo-do-contrato--completo',
  estilo: 'telas-3-1-estilo-logo-e-aceites--padrao',
  pagamento: 'telas-4-1-pagamento--padrao',
  sucesso: 'telas-5-1-sucesso-e-download--padrao',
  sucessoEnviado: 'telas-5-1-sucesso-e-download--pdf-enviado',
  enviarPdf: 'telas-5-2-enviar-por-e-mail-ou-whatsapp--padrao',
  resumoCompartilhado: 'telas-a-resumo-compartilhado--so-conferir',
  retomar: 'telas-b-retomar-resumo--padrao',
  linkExpirado: 'telas-c-link-expirado--padrao',
} as const;

/** Página (do resumo) → tela. */
const TELA_DA_PAGINA: Record<PaginaId, string> = {
  'tipo-locacao': TELAS.tipoDeLocacao,
  dono: TELAS.dono,
  inquilino: TELAS.inquilino,
  administracao: TELAS.administracao,
  imovel: TELAS.imovel,
  valores: TELAS.valores,
  convivencia: TELAS.convivencia,
  reparos: TELAS.reparos,
  saida: TELAS.saida,
};

export function irPara(storyId: string): void {
  if (typeof window === 'undefined') return;
  if (window.parent !== window) {
    window.parent.postMessage({ source: 'prototype-nav', storyId }, window.location.origin);
  } else {
    window.location.href = `iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
  }
}

/** Leva à tela do item clicado no resumo (e ao campo dele). */
export const irParaSecao = (_grupo: string, item?: string): void => { pedirFoco(item); irPara(TELA_DA_PAGINA[paginaDoItem(item)]); };

/** Como `irParaSecao`, mas para o "Editar" da revisão: a página de destino oferece "Salvar e voltar ao resumo". */
export const irEditarDoResumo = (grupo: string, item?: string): void => { pedirEdicaoDoResumo(item); irParaSecao(grupo, item); };

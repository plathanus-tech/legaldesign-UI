import { useMemo } from 'react';
import { lerEdicaoDoResumo } from './foco';
import { paginaDoItem, type PaginaId } from './resumo';

/**
 * A pessoa chegou a esta página pelo "Editar" (ou "Completar") da revisão? Então, em vez de "Seguinte", a página oferece
 * "Salvar e voltar ao resumo". Só vale na página do item que ela foi editar: se ela sair para outra página pelo índice, volta ao normal.
 */
export function useEdicaoDoResumo(pagina: PaginaId): boolean {
  return useMemo(() => {
    const item = lerEdicaoDoResumo();
    return !!item && paginaDoItem(item) === pagina;
  }, [pagina]);
}

/** Texto do botão que volta à revisão. */
export const SALVAR_E_VOLTAR = 'Salvar e voltar ao resumo';

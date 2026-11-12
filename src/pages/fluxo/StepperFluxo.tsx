import { Check } from 'lucide-react';
import { cx } from '../../utils/cx';
import { ETAPAS_DO_FLUXO } from './etapas';
import styles from './StepperFluxo.module.css';

export interface StepperFluxoProps {
  /** Etapa principal atual (posição em `ETAPAS_DO_FLUXO`): 0 Preencher · 1 Revisar · 2 Pagar · 3 Baixar PDF. */
  etapa: number;
  /** Página atual dentro da etapa, a partir de 1. Sem ela, o stepper das páginas não aparece. */
  pagina?: number;
}

type Estado = 'feita' | 'atual' | 'futura';
const estadoDe = (i: number, atual: number): Estado => (i < atual ? 'feita' : i === atual ? 'atual' : 'futura');
const TEXTO_DO_ESTADO: Record<Estado, string> = { feita: 'concluída', atual: 'atual', futura: 'próxima' };

/**
 * Os dois níveis de progresso do fluxo, um dentro do outro:
 * 1. Stepper geral (maior destaque): as etapas principais, com número ou marca de concluída, nome curto e uma linha que as liga.
 *    Em telas estreitas os círculos e as linhas continuam, mas só a etapa atual mostra o nome, para tudo caber sem cortar texto.
 * 2. Stepper das páginas (discreto): as páginas da etapa atual, num bloco logo abaixo que repete o nome da etapa, com uma barra
 *    de trechos finos (um por página) e o nome da página atual. Etapas com uma só página não mostram este nível, e etapas com
 *    mais páginas simplesmente ganham mais trechos.
 * Os estados (concluída, atual, futura) usam as mesmas cores nos dois níveis. É só um indicador: não leva a lugar nenhum.
 */
export function StepperFluxo({ etapa, pagina }: StepperFluxoProps) {
  const def = ETAPAS_DO_FLUXO[etapa];
  const paginas = def?.paginas ?? [];
  const mostrarPaginas = pagina !== undefined && paginas.length > 1 && pagina >= 1 && pagina <= paginas.length;

  return (
    <nav aria-label="Progresso do contrato" className={styles.stepper}>
      <ol className={styles.geral}>
        {ETAPAS_DO_FLUXO.map((e, i) => {
          const estado = estadoDe(i, etapa);
          return (
            <li key={e.nome} className={cx(styles.etapa, styles[estado])} aria-current={estado === 'atual' ? 'step' : undefined}>
              <span className={styles.num} aria-hidden="true">{estado === 'feita' ? <Check size={16} /> : i + 1}</span>
              <span className={styles.nome}>
                {e.nome}
                <span className={styles.somenteLeitura}> ({TEXTO_DO_ESTADO[estado]})</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Páginas da etapa atual */}
      {mostrarPaginas && pagina !== undefined && (
        <div className={styles.paginas}>
          <p className={styles.paginasTexto}>
            <span className={styles.paginasEtapa}>{def.nome}</span> · página {pagina} de {paginas.length}: <strong className={styles.paginasNome}>{paginas[pagina - 1]}</strong>
          </p>
          <ol className={styles.paginasLista} aria-label={`Páginas de ${def.nome}`}>
            {paginas.map((nome, i) => {
              const estado = estadoDe(i, pagina - 1);
              return <li key={nome} className={cx(styles.pagina, styles[estado])} aria-label={`${nome}, ${TEXTO_DO_ESTADO[estado]}`} aria-current={estado === 'atual' ? 'step' : undefined} />;
            })}
          </ol>
        </div>
      )}
    </nav>
  );
}

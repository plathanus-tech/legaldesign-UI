import { House, Info, UserRound, Wallet } from 'lucide-react';
import type { EstiloId } from './estilos';
import styles from './Finalizar.module.css';

/**
 * Miniatura borrada de cada estilo, só com formas (nenhum texto de contrato): Clássico, com texto corrido e títulos centralizados;
 * Moderno, com ícones, destaques e blocos explicativos (a mesma ideia da ilustração da tela inicial); Minimalista, com muito
 * espaço e poucos elementos. Serve só para ver o formato da página.
 */
export function PreviaEstilo({ estilo }: { estilo: EstiloId }) {
  if (estilo === 'moderno') {
    return (
      <span className={`${styles.previa} ${styles.previaModerno}`} aria-hidden="true">
        <span className={styles.mCabeca}>
          <span className={styles.mMarca} />
          <span className={styles.mBarras}><span className={styles.mBarraForte} /><span className={styles.mBarraSuave} /></span>
        </span>
        <span className={styles.mBlocos}>
          <span className={styles.mBloco}><UserRound size={12} /></span>
          <span className={`${styles.mBloco} ${styles.mDestaque}`}><House size={12} /></span>
          <span className={styles.mBloco}><Wallet size={12} /></span>
        </span>
        <span className={styles.mCallout}><Info size={12} /><span className={styles.mLinhas}><span className={styles.linhaTexto} /><span className={styles.linhaCurta} /></span></span>
        <span className={styles.linhaTexto} />
        <span className={styles.linhaCurta} />
      </span>
    );
  }
  if (estilo === 'minimalista') {
    return (
      <span className={`${styles.previa} ${styles.previaMinimalista}`} aria-hidden="true">
        <span className={styles.minTitulo} />
        <span className={styles.minRegua} />
        <span className={styles.minSecao}><span className={styles.minTituloSecao} /><span className={styles.linhaTexto} /><span className={styles.linhaCurta} /></span>
        <span className={styles.minSecao}><span className={styles.minTituloSecao} /><span className={styles.linhaTexto} /></span>
      </span>
    );
  }
  return (
    <span className={`${styles.previa} ${styles.previaClassico}`} aria-hidden="true">
      <span className={styles.cTitulo} />
      <span className={styles.cSub} />
      {[0, 1, 2, 3, 4].map(i => <span key={i} className={styles.linhaTexto} />)}
      <span className={styles.linhaCurta} />
      <span className={styles.cSecao} />
      {[0, 1, 2].map(i => <span key={i} className={styles.linhaTexto} />)}
    </span>
  );
}

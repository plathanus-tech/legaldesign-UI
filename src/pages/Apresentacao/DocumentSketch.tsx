import { CalendarDays, FileText, House, Info, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './DocumentSketch.module.css';

export type SketchVariant = 'tradicional' | 'classico' | 'visual-law' | 'minimalista';

interface LinesProps { count: number; shortLast?: boolean }

function Lines({ count, shortLast = true }: LinesProps) {
  return (
    <div className={styles.lines}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx(styles.line, shortLast && i === count - 1 && styles.short)} />
      ))}
    </div>
  );
}

/**
 * Miniatura abstrata de um documento (só barras, nenhum texto real).
 * Decorativa: não expõe conteúdo de cláusulas e não é lida por leitores de tela.
 * Específica desta página: ilustra o contrato antes/depois do Legal Design e os 3 estilos.
 */
export function DocumentSketch({ variant, icones = false }: { variant: SketchVariant; icones?: boolean }) {
  return (
    <div className={cx(styles.sheet, styles[variant])} aria-hidden="true">
      {variant === 'tradicional' && (
        <>
          <span className={cx(styles.bar, styles.titleBar, styles.center)} />
          <Lines count={7} />
          <Lines count={6} />
          <Lines count={7} />
          <Lines count={5} />
        </>
      )}

      {variant === 'classico' && (
        <>
          <span className={cx(styles.bar, styles.titleBar, styles.center)} />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={styles.clause}>
              <span className={styles.number} />
              <Lines count={3} />
            </div>
          ))}
        </>
      )}

      {variant === 'visual-law' && (
        <>
          <div className={styles.band}><span className={cx(styles.bar, styles.bandBar)} /></div>
          <div className={styles.facts}>
            {[UserRound, House, Wallet, CalendarDays].map((Icone, i) => (
              <span key={i} className={cx(styles.chip, icones && styles.chipIcone)}>{icones && <Icone size={12} />}</span>
            ))}
          </div>
          <div className={styles.row}>
            <span className={styles.icon}>{icones && <FileText size={16} />}</span>
            <Lines count={2} />
          </div>
          <div className={cx(styles.callout, icones && styles.calloutIcone)}>
            {icones && <Info size={16} className={styles.calloutIco} />}
            <Lines count={3} />
          </div>
          <div className={styles.row}>
            <span className={styles.icon}>{icones && <ShieldCheck size={16} />}</span>
            <Lines count={2} />
          </div>
        </>
      )}

      {variant === 'minimalista' && (
        <>
          <span className={cx(styles.bar, styles.thinTitle)} />
          <span className={styles.rule} />
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.section}>
              <span className={cx(styles.bar, styles.heading)} />
              <Lines count={2} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

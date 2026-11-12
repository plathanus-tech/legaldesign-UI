import { CreditCard, ShieldCheck, UserRoundX } from 'lucide-react';
import { cx } from '../../utils/cx';
import { DocumentSketch } from './DocumentSketch';
import styles from './PalcoDoHero.module.css';

/**
 * Ilustração do hero: a miniatura de um documento (só barras e ícones, sem texto de cláusula) com três cartões translúcidos de ícones.
 * Decorativa. Com a opção "brilho", ganha um brilho verde bem suave por trás. Com "icones", o documento mostra ícones nos blocos.
 */
export function PalcoDoHero({ brilho = false, icones = false }: { brilho?: boolean; icones?: boolean }) {
  return (
    <div className={cx(styles.palco, brilho && styles.brilho)} aria-hidden="true">
      <div className={cx(styles.cartao, styles.documento)}><DocumentSketch variant="visual-law" icones={icones} /></div>
      <div className={cx(styles.cartao, styles.icone, styles.verde)}><ShieldCheck size={24} /></div>
      <div className={cx(styles.cartao, styles.icone, styles.azul)}><CreditCard size={24} /></div>
      <div className={cx(styles.cartao, styles.icone, styles.amarelo)}><UserRoundX size={24} /></div>
    </div>
  );
}

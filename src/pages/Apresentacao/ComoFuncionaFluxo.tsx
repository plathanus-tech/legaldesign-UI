import { ReactNode } from 'react';
import { Check, ClipboardList, CreditCard, Download, ListChecks, QrCode } from 'lucide-react';
import { Badge } from '../../index';
import { PASSOS } from './content';
import styles from './ComoFuncionaFluxo.module.css';

/** Mini-visual de cada etapa: formas e rótulos curtos, sem dados nem texto de contrato. */
const VISUAIS: ReactNode[] = [
  // 1 · Informe os dados: um campo e uma escolha rápida
  <div key="dados" className={styles.visualInner}>
    <span className={styles.labelBar} />
    <span className={styles.input}><span className={styles.inputText} /></span>
    <div className={styles.chips}>
      <Badge status="brand">Sim</Badge>
      <Badge>Não</Badge>
    </div>
  </div>,

  // 2 · Confira as informações: resumo com itens conferidos e um sugerido
  <ul key="resumo" className={`${styles.visualInner} ${styles.checks}`}>
    <li><Check size={16} aria-hidden="true" /><span className={styles.bar} style={{ width: '56%' }} /></li>
    <li><Check size={16} aria-hidden="true" /><span className={styles.bar} style={{ width: '72%' }} /></li>
    <li><Check size={16} aria-hidden="true" /><span className={styles.bar} style={{ width: '44%' }} /><Badge>Cláusula padrão</Badge></li>
  </ul>,

  // 3 · Realize o pagamento: as formas de pagar
  <div key="pagamento" className={`${styles.visualInner} ${styles.tiles}`}>
    <span className={`${styles.tile} ${styles.tileOn}`}><QrCode size={20} aria-hidden="true" />Pix</span>
    <span className={styles.tile}><CreditCard size={20} aria-hidden="true" />Cartão</span>
  </div>,

  // 4 · Receba seu documento: o PDF pronto para baixar
  <div key="pdf" className={`${styles.visualInner} ${styles.pdf}`}>
    <span className={styles.page}>
      <span className={styles.pageBand} />
      <span className={styles.pageLine} />
      <span className={styles.pageLine} />
      <span className={styles.pageLineShort} />
    </span>
    <Badge status="brand">PDF</Badge>
    <span className={styles.download}><Download size={20} aria-hidden="true" /></span>
  </div>,
];

const ICONES = [ClipboardList, ListChecks, CreditCard, Download];

/**
 * Fluxo do "Como funciona": linha do tempo vertical com um nó (ícone) por etapa, o título, o texto e um mini-visual
 * do que acontece na etapa. Só formas, rótulos curtos e tokens da Base.
 */
export function ComoFuncionaFluxo() {
  return (
    <ol className={styles.flow}>
      {PASSOS.map((passo, i) => {
        const Icone = ICONES[i];
        return (
          <li key={passo.titulo} className={styles.step}>
            <span className={styles.node} aria-hidden="true"><Icone size={20} /></span>
            <div className={styles.body}>
              <p className={styles.kicker}>Passo {i + 1}</p>
              <p className={styles.title}>{passo.titulo}</p>
              <p className={styles.text}>{passo.texto}</p>
              <div className={styles.visual} aria-hidden="true">{VISUAIS[i]}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

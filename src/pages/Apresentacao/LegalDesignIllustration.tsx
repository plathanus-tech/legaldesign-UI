import { House, Info, UserRound, Wallet } from 'lucide-react';
import styles from './LegalDesignIllustration.module.css';

/** Parágrafo de contrato tradicional: linhas coladas, justificadas, a primeira recuada e a última curta. */
function TradParagraph({ lines }: { lines: number }) {
  return (
    <div className={styles.tPara}>
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          className={`${styles.tLine} ${i === 0 ? styles.tIndent : ''} ${i === lines - 1 ? styles.tLast : ''}`}
        />
      ))}
    </div>
  );
}

/**
 * Ilustração própria da plataforma: a primeira folha de um contrato que se transforma. Começa como um contrato
 * TRADICIONAL (título centralizado, texto corrido e denso, sem hierarquia) e, em ciclo, se organiza em Legal Design
 * (título e subtítulo, resumo em blocos, destaque, seções). Só formas e barras com tokens da Base: não traz texto de
 * cláusula, dados pessoais nem conteúdo jurídico. Uma faixa no topo diz em que momento estamos ("Antes · Contrato comum" e
 * "Depois · Legal design") e troca no mesmo ritmo da animação, para ficar claro que o comum é o ponto de partida e que o
 * Legal Design é o que a plataforma faz com ele. Sem animação (movimento reduzido), fica parada na versão organizada, com o
 * rótulo "Depois".
 */
export function LegalDesignIllustration() {
  return (
    <div className={styles.page} role="img" aria-label="Exemplo: um contrato comum, com texto corrido e denso, que vira um contrato com legal design, organizado em título, resumo e seções">
      {/* Em que momento estamos: antes (contrato comum) ou depois (legal design) */}
      <div className={styles.rotulos}>
        <span className={`${styles.rotulo} ${styles.rotuloAntes}`}><span className={styles.ponto} />Antes · Contrato comum</span>
        <span className={`${styles.rotulo} ${styles.rotuloDepois}`}><span className={styles.ponto} />Depois · Legal design</span>
      </div>

      {/* Contrato tradicional: título centralizado e texto corrido */}
      <div className={styles.trad}>
        <span className={styles.tTitle} />
        <span className={styles.tTitleSub} />
        <TradParagraph lines={7} />
        <span className={styles.tHeading} />
        <TradParagraph lines={7} />
        <span className={styles.tHeading} />
        <TradParagraph lines={6} />
      </div>

      {/* Legal Design: o mesmo documento, organizado */}
      <div className={styles.vl}>
        {/* Título e subtítulo: hierarquia clara */}
        <div className={styles.head}>
          <span className={styles.mark} />
          <div className={styles.titles}>
            <span className={styles.title} />
            <span className={styles.subtitle} />
          </div>
        </div>

        {/* Resumo em blocos, com um destaque */}
        <div className={styles.facts}>
          <div className={styles.fact}>
            <UserRound size={16} className={styles.factIcon} />
            <span className={styles.label} />
            <span className={styles.value} />
          </div>
          <div className={`${styles.fact} ${styles.factHighlight}`}>
            <House size={16} className={styles.factIcon} />
            <span className={styles.label} />
            <span className={`${styles.value} ${styles.valueStrong}`} />
          </div>
          <div className={styles.fact}>
            <Wallet size={16} className={styles.factIcon} />
            <span className={styles.label} />
            <span className={styles.value} />
          </div>
        </div>

        {/* Seção */}
        <div className={styles.section}>
          <span className={styles.heading} />
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={`${styles.line} ${styles.short}`} />
        </div>

        {/* Destaque para a informação importante */}
        <div className={styles.callout}>
          <Info size={16} className={styles.calloutIcon} />
          <div className={styles.calloutLines}>
            <span className={styles.line} />
            <span className={`${styles.line} ${styles.short}`} />
          </div>
        </div>

        {/* Outra seção */}
        <div className={styles.section}>
          <span className={styles.heading} />
          <span className={styles.line} />
          <span className={`${styles.line} ${styles.short}`} />
        </div>
      </div>
    </div>
  );
}

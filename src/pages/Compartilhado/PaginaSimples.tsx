import type { ReactNode } from 'react';
import { AppHeader } from '../../index';
import styles from './PaginaSimples.module.css';

/**
 * Casca das telas de acesso por link (A, B, C): cabeçalho só com o nome do modelo, sem as etapas do preenchimento e sem o
 * botão de sair, porque quem chega por um link ainda não está no fluxo.
 */
export function PaginaSimples({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <AppHeader align="start" logo={<span className={styles.modelo}>Contrato de locação de imóvel</span>} />
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

import { Link2Off } from 'lucide-react';
import { Button, EmptyState } from '../../index';
import styles from '../fluxo/PaginaEtapa.module.css';
import { PaginaSimples } from './PaginaSimples';

export interface LinkExpiradoProps {
  /** Começa um contrato novo. */
  onNovoContrato?: () => void;
}

/**
 * Tela C: link expirado (ou que não existe mais). Explica em palavras simples o que aconteceu e o que fazer: o resumo fica guardado por 15 dias e depois é apagado; só resta
 * começar outro contrato. Não mostra nenhum dado do contrato.
 */
export function LinkExpirado({ onNovoContrato }: LinkExpiradoProps) {
  return (
    <PaginaSimples>
      <div className={styles.pagina}>
        <EmptyState
          headingLevel={1}
          icon={<Link2Off size={32} />}
          title="Este link não está mais disponível"
          description="Os resumos ficam guardados por 15 dias e depois são apagados de nosso banco de dados. Comece um novo contrato."
          action={<Button onClick={onNovoContrato}>Começar um novo contrato</Button>}
        />
      </div>
    </PaginaSimples>
  );
}

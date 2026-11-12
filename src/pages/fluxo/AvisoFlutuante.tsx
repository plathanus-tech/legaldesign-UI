import { useEffect, useState } from 'react';
import { Feedback } from '../../index';
import styles from './AvisoDeErros.module.css';

export interface AvisoFlutuanteDados {
  /** Muda a cada aviso novo (mesmo com o mesmo texto), para o aviso aparecer de novo. */
  id: number;
  message: string;
  title?: string;
}

/**
 * Aviso de sucesso do fluxo: centralizado no alto, abaixo do cabeçalho, no mesmo lugar e com o mesmo comportamento do `AvisoDeErros`.
 * Some sozinho depois de um tempo de leitura, pode ser fechado (X ou Esc) e para de contar enquanto o mouse ou o foco estão nele.
 */
export function AvisoFlutuante({ aviso }: { aviso: AvisoFlutuanteDados | null }) {
  const [fechado, setFechado] = useState<number | null>(null); // id do aviso que foi fechado
  const [parado, setParado] = useState(false);
  const visivel = aviso !== null && aviso.id !== fechado;

  useEffect(() => {
    if (!aviso || !visivel || parado) return;
    const palavras = `${aviso.title ?? ''} ${aviso.message}`.trim().split(/\s+/).length;
    const espera = window.setTimeout(() => setFechado(aviso.id), 5000 + palavras * 300);
    return () => window.clearTimeout(espera);
  }, [aviso, visivel, parado]);

  if (!aviso || !visivel) return null;
  return (
    <div
      className={styles.aviso}
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={() => setParado(false)}
      onKeyDown={e => { if (e.key === 'Escape') setFechado(aviso.id); }}
    >
      <Feedback type="success" title={aviso.title} message={aviso.message} dismissible onDismiss={() => setFechado(aviso.id)} dismissLabel="Fechar aviso" />
    </div>
  );
}

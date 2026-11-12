import { useEffect, useState } from 'react';
import { Feedback } from '../../index';
import { focarCampo } from './foco';
import styles from './AvisoDeErros.module.css';

/**
 * Padrão de erro ao tentar seguir, para todas as telas do fluxo:
 * - com UM erro, vai direto para o item (`levarAoPrimeiroErro`), sem componente de feedback;
 * - com VÁRIOS, vai para o primeiro e mostra este aviso, centralizado no alto, por um tempo de leitura. Ele pode ser fechado
 *   (X ou Esc) e para de contar enquanto o mouse ou o foco estão nele.
 * O erro de cada item continua no próprio item (borda vermelha e texto de ajuda).
 */
export function AvisoDeErros({ tentativa, quantidade, frase }: { tentativa: number; quantidade: number; frase?: (n: number) => string }) {
  const [fechado, setFechado] = useState(0); // tentativa que foi fechada
  const [parado, setParado] = useState(false);
  const mensagem = (frase ?? frasePadrao)(quantidade);
  const visivel = tentativa > 0 && tentativa !== fechado && quantidade > 1;

  useEffect(() => {
    if (!visivel || parado) return;
    const palavras = mensagem.split(/\s+/).length;
    const espera = window.setTimeout(() => setFechado(tentativa), 5000 + palavras * 300);
    return () => window.clearTimeout(espera);
  }, [visivel, parado, tentativa, mensagem]);

  if (!visivel) return null;
  return (
    <div
      className={styles.aviso}
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={() => setParado(false)}
      onKeyDown={e => { if (e.key === 'Escape') setFechado(tentativa); }}
    >
      <Feedback type="error" message={mensagem} dismissible onDismiss={() => setFechado(tentativa)} dismissLabel="Fechar aviso" />
    </div>
  );
}

const frasePadrao = (n: number) => `Faltam ${n} informações. Elas estão marcadas em vermelho.`;

const REDUZIDO = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Rola até o primeiro item marcado com `data-invalido="true"` (na ordem da página) e põe o foco no primeiro campo dele.
 * Espera a tela desenhar os erros antes. Blocos altos (como os cards de estilo) rolam até o começo; os demais, até o meio.
 */
export function levarAoPrimeiroErro(raiz?: ParentNode | null): void {
  window.setTimeout(() => {
    const escopo = raiz ?? document;
    const alvo = escopo.querySelector<HTMLElement>('[data-invalido="true"]');
    if (!alvo) return;
    const alto = alvo.getBoundingClientRect().height > window.innerHeight * 0.7;
    alvo.scrollIntoView({ block: alto ? 'start' : 'center', behavior: REDUZIDO() ? 'auto' : 'smooth' });
    const campoAlvo = alvo.querySelector<HTMLElement>('input:not([type=hidden]):not(:disabled), select, textarea, button:not(:disabled)');
    focarCampo(campoAlvo);
  }, 60);
}

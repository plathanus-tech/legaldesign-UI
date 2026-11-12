import { MouseEvent, ReactNode } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button, Card } from '../../index';
import styles from './ModelCard.module.css';

export interface ModelCardProps {
  /** Nome do modelo: é o elemento principal do card (um nível abaixo do título da página). */
  nome: string;
  /** Breve descrição da finalidade do modelo. */
  descricao: string;
  /** Informações curtas e pequenas sobre o modelo (ex.: para quem é, o que se recebe). */
  detalhes?: string[];
  /** Valor de cada estilo do documento (ex.: Clássico, Moderno), para a pessoa saber quanto custa antes de começar. Vem do projeto, nunca é calculado aqui. */
  valores?: { rotulo: string; valor: string }[];
  /** Atualização jurídica relevante, em linguagem simples e validada pela equipe. Sem valor, não aparece. */
  atualizacao?: ReactNode;
  /** Frase curta sobre o que foi atualizado e em que se baseia, em linguagem simples (ex.: "De acordo com a lei e as decisões do STJ"). Aparece em letra menor, junto da data. */
  fundamento?: string;
  /** Data da última atualização do modelo (real, fornecida pelo projeto). Sem valor, a data não aparece. */
  atualizadoEm?: string | null;
  /**
   * Ilustração do modelo (decorativa, ex.: `<img src="…" alt="" />`), sobre um painel claro da cor da marca.
   * Card largo: lateral direita (cerca de 32% do card, 40% no tablet). Card estreito (celular): faixa no topo.
   */
  ilustracao?: ReactNode;
  /** Texto do botão (ex.: "Começar a preencher"). */
  acao: string;
  onAction: () => void;
}

/**
 * Card de modelo do catálogo, objetivo e independente do tipo de contrato: nome (principal), finalidade, informações pequenas, base da atualização, data e ação, com a ilustração do modelo na lateral.
 * Largo, o texto fica à esquerda e a revisão e a ação à direita do texto; estreito, tudo empilha, então serve
 * também para vários modelos lado a lado.
 */
export function ModelCard({ nome, descricao, detalhes, valores, atualizacao, fundamento, atualizadoEm, ilustracao, acao, onAction }: ModelCardProps) {
  // O card inteiro leva à mesma ação (conveniência para o mouse e o toque). Quem usa teclado ou leitor de tela
  // usa o botão; por isso o clique no próprio botão não é contado duas vezes.
  const aoClicar = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('button')) onAction();
  };

  return (
    <div className={styles.clicavel} onClick={aoClicar}>
    <Card className={styles.card} padding="none">
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.inner}>
            <div className={styles.main}>
              <h2 className={styles.name}>{nome}</h2>
              <p className={styles.desc}>{descricao}</p>
              {atualizacao && <p className={styles.note}>{atualizacao}</p>}
              {detalhes && detalhes.length > 0 && (
                <ul className={styles.details}>
                  {detalhes.map(d => <li key={d}>{d}</li>)}
                </ul>
              )}
              {valores && valores.length > 0 && (
                <dl className={styles.prices} aria-label="Valor de cada estilo do documento">
                  {valores.map(v => (
                    <div key={v.rotulo} className={styles.price}>
                      <dt>{v.rotulo}</dt>
                      <dd>{v.valor}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className={styles.aside}>
              <div className={styles.action}>
                <Button size="md" iconRight={<ArrowRight size={20} />} onClick={onAction}>{acao}</Button>
              </div>
              {(atualizadoEm || fundamento) && (
                <div className={styles.meta}>
                  <CalendarDays size={16} aria-hidden="true" />
                  <p className={styles.metaText}>
                    {atualizadoEm && <span className={styles.metaDate}>Última atualização do modelo: <time>{atualizadoEm}</time></span>}
                    {fundamento && <span className={styles.metaNote}>{fundamento}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {ilustracao && <div className={styles.art} aria-hidden="true">{ilustracao}</div>}
      </div>
    </Card>
    </div>
  );
}

import { useId, useState } from 'react';
import { ChevronDown, CircleDashed, TriangleAlert } from 'lucide-react';
import { IconeGrupo } from './IconeGrupo';
import { cx } from '../../utils/cx';
import styles from './ResumoArvore.module.css';

export interface ResumoItem {
  /** Identifica o item para levar direto ao campo (ex.: 'dono'). Sem id, o item não é clicável. */
  id?: string;
  rotulo: string;
  valor: string;
  /** O que essa resposta decide no contrato, em linguagem simples. Nunca o texto da cláusula. */
  efeito?: string;
}

/**
 * Estado de uma seção no índice:
 * - `preenchida`: tem respostas; dá para voltar e corrigir.
 * - `atual`: a página em que a pessoa está.
 * - `pendente`: ainda não chegou lá; aparece apagada e sem detalhes (as perguntas dependem das respostas anteriores).
 * - `atencao`: já preenchida, mas uma resposta anterior mudou e vale revisar.
 */
export type EstadoSecao = 'preenchida' | 'atual' | 'pendente' | 'atencao';

/** Uma pergunta obrigatória que ainda não foi respondida. */
export interface ItemFalta {
  /** Leva direto à pergunta (mesmo id dos itens respondidos). */
  id?: string;
  rotulo: string;
}

export interface ResumoGrupo {
  id: string;
  titulo: string;
  itens: ResumoItem[];
  /** O que ainda falta responder nesta seção (só as perguntas obrigatórias que já se sabe que aparecem). */
  faltam?: ItemFalta[];
  /** Podem aparecer mais perguntas nesta seção, conforme as respostas que ainda não foram dadas. */
  maisPerguntas?: boolean;
  /** Sem ele, deduz: com respostas = preenchida; sem = pendente. */
  estado?: EstadoSecao;
  /** Explica por que a seção precisa de atenção (estado `atencao`). */
  aviso?: string;
}

export interface ResumoArvoreProps {
  grupos: ResumoGrupo[];
  /** Leva ao item (ou à seção). Sem ele, a árvore só mostra o andamento, sem links. */
  onIr?: (grupoId: string, itemId?: string) => void;
}

const estadoDe = (g: ResumoGrupo): EstadoSecao => g.estado ?? (g.itens.length > 0 ? 'preenchida' : 'pendente');

function ItemTexto({ item }: { item: ResumoItem }) {
  return (
    <>
      <span className={styles.rotulo}>{item.rotulo}</span>
      <span className={styles.valor}>{item.valor}</span>
      {item.efeito && <span className={styles.efeito}>{item.efeito}</span>}
    </>
  );
}

function Grupo({ grupo, onIr }: { grupo: ResumoGrupo; onIr?: (grupoId: string, itemId?: string) => void }) {
  const listaId = useId();
  const estado = estadoDe(grupo);
  const total = grupo.itens.length;
  const faltam = grupo.faltam ?? [];
  // seções com respostas ou em que a pessoa está começam abertas; as que ainda não chegaram começam fechadas, mas dá para abrir e ver o que falta
  const [aberto, setAberto] = useState(total > 0 || estado === 'atual');
  const podeRecolher = total > 0 || faltam.length > 0;

  const status =
    estado === 'atual' ? 'Você está aqui'
    : estado === 'pendente' ? 'Não preenchido'
    : estado === 'atencao' ? 'Revisar'
    : total === 1 ? '1 resposta' : `${total} respostas`;

  const titulo = (
    <>
      <IconeGrupo id={grupo.id} className={styles.iconeGrupo} />
      <span className={styles.titulo}>{grupo.titulo}</span>
      {estado === 'atencao' && <TriangleAlert size={16} aria-hidden="true" className={styles.iconeAtencao} />}
    </>
  );

  return (
    <section
      className={cx(styles.grupo, estado === 'pendente' && styles.pendente, estado === 'atual' && styles.atual, estado === 'atencao' && styles.atencao)}
      aria-label={grupo.titulo}
      aria-current={estado === 'atual' ? 'step' : undefined}
    >
      <div className={styles.cabecalho}>
        {podeRecolher ? (
          <button
            type="button"
            className={styles.recolher}
            aria-expanded={aberto}
            aria-controls={listaId}
            aria-label={`${aberto ? 'Recolher' : 'Expandir'} ${grupo.titulo}`}
            onClick={() => setAberto(a => !a)}
          >
            <ChevronDown size={16} aria-hidden="true" className={cx(styles.seta, !aberto && styles.recolhida)} />
          </button>
        ) : (
          <span className={styles.recolherVazio} aria-hidden="true" />
        )}

        <span className={styles.nome}>{titulo}</span>

        <span className={cx(styles.status, estado === 'atual' && styles.statusAtual, estado === 'atencao' && styles.statusAtencao)}>{status}</span>
      </div>

      {estado === 'atencao' && grupo.aviso && <p className={styles.aviso}>{grupo.aviso}</p>}

      {podeRecolher && (
        <div id={listaId} hidden={!aberto}>
          {total > 0 && (
            <ul className={styles.lista}>
              {grupo.itens.map(i => (
                <li key={i.rotulo} className={styles.item}>
                  {onIr && i.id ? (
                    <button type="button" className={styles.itemLink} onClick={() => onIr(grupo.id, i.id)}>
                      <ItemTexto item={i} />
                    </button>
                  ) : (
                    <ItemTexto item={i} />
                  )}
                </li>
              ))}
            </ul>
          )}

          {faltam.length > 0 && (
            <div className={styles.faltam}>
              <p className={styles.faltamTitulo}>Falta preencher</p>
              <ul className={styles.faltamLista}>
                {faltam.map(f => (
                  <li key={f.rotulo}>
                    <span className={styles.faltaLink}>
                      <CircleDashed size={16} aria-hidden="true" className={styles.faltaIcone} />
                      <span>{f.rotulo}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {grupo.maisPerguntas && <p className={styles.faltamNota}>Podem aparecer mais perguntas, conforme as suas respostas.</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Índice do contrato em árvore: mostra o que já foi preenchido, onde a pessoa está, o que ainda falta (apagado e sem
 * detalhes, porque as perguntas dependem do que veio antes) e o que merece revisão. As seções preenchidas levam de
 * volta à página para corrigir. Mostra só as respostas, nunca o texto das cláusulas. Sem porcentagem: como as
 * perguntas mudam conforme as respostas, um total em % mudaria no meio do caminho.
 */
export function ResumoArvore({ grupos, onIr }: ResumoArvoreProps) {
  return (
    <div className={styles.arvore}>
      {grupos.map(g => <Grupo key={g.id} grupo={g} onIr={onIr} />)}
    </div>
  );
}

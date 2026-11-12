import { useEffect, useRef, useState } from 'react';
import { AlertCircle, MessageSquareText, Pencil } from 'lucide-react';
import { IconeGrupo } from '../fluxo/IconeGrupo';
import { focarSeTeclado } from '../fluxo/foco';
import { Accordion, Badge, Button, Checkbox } from '../../index';
import { cx } from '../../utils/cx';
import { frasePonto, GRUPOS_PADRAO, OUTRO, pontoPersonalizado, pontosPadraoDoImovel, type PontoPadrao } from '../fluxo/perguntas';
import { frasesDoGrupo, paginaDoItem, type Pendencia, type PaginaId } from '../fluxo/resumo';
import type { Contrato, Imovel } from '../fluxo/respostas';
import type { ResumoGrupo } from '../fluxo/ResumoArvore';
import styles from './PainelContrato.module.css';

/** Em que grupo do resumo fica cada página. */
const GRUPO_DA_PAGINA: Record<PaginaId, string> = {
  'tipo-locacao': 'imovel', imovel: 'imovel', dono: 'pessoas', inquilino: 'pessoas', administracao: 'pessoas',
  valores: 'valores', convivencia: 'convivencia', reparos: 'reparos', saida: 'saida',
};
/** Para onde "Preencher" leva quando o grupo ainda está vazio. */
const PRIMEIRO_ITEM: Record<string, string> = { imovel: 'uso', pessoas: 'dono', valores: 'va-aluguel', convivencia: 'co-sublocar', reparos: 're-obras', saida: 'sa-garantia' };

/** Uma informação da árvore que dá para marcar (modo de seleção de quem recebeu o link). */
export interface ItemSelecionavel {
  /** Identifica a informação (grupo e item). */
  chave: string;
  /** Título do assunto onde ela está, para agrupar a mensagem. */
  secao: string;
  texto: string;
  /** Posição na árvore, para manter a ordem original. */
  ordem: number;
}

export interface SelecaoDoPainel {
  /** Chaves das informações marcadas. */
  escolhidos: string[];
  onAlternar: (item: ItemSelecionavel) => void;
}

export interface PainelContratoProps {
  grupos: ResumoGrupo[];
  /** Páginas com perguntas sem resposta (só na revisão de quem está preenchendo). */
  pendencias?: Pendencia[];
  /** Tipo do imóvel: os pontos de condomínio só aparecem para imóvel em condomínio. */
  imovel?: Imovel | null;
  /** Respostas, para mostrar os pontos de cláusulas padrão já personalizados. */
  contrato: Contrato;
  /** Mostra "Editar", "Preencher" e "Personalizar". Desligue para quem só vai conferir. */
  editavel?: boolean;
  onEditar?: (grupoId: string, itemId?: string) => void;
  onPersonalizar?: (ponto: PontoPadrao) => void;
  /** Quem preencheu, na legenda. Padrão: "Preenchido por você". */
  quemPreencheu?: string;
  titulo?: string;
  subtitulo?: string;
  /** Marca (`data-pendente`) as linhas de itens que faltam, para a tela levar o foco até a primeira. */
  painelRef?: React.RefObject<HTMLDivElement>;
  /** Cada vez que muda (e é maior que 0), abre o assunto da primeira pendência e leva o foco até ela. */
  levarAPendencia?: number;
  /** O item que a pessoa acabou de editar (ao voltar de uma página): abre o assunto dele e leva o foco à linha. Pendências têm prioridade. */
  focoEm?: string;
  /** Modo de seleção (só para quem confere): cada informação ganha um checkbox. Sem isso, a árvore é só leitura. */
  selecao?: SelecaoDoPainel;
  /** Conteúdo logo abaixo das etiquetas de quem preencheu, dentro do card (ex.: o convite para selecionar informações). */
  abaixoDaLegenda?: React.ReactNode;
  /** Só leitura: um botão em cada informação para comentar só aquele ponto (sem entrar no modo de seleção). Some no modo de seleção. */
  onComentar?: (item: ItemSelecionavel) => void;
}

/**
 * O resumo em frases de tudo o que vai no contrato: o que foi preenchido e o que o sistema sugere (cláusulas padrão),
 * sem o texto das cláusulas. Cada assunto é um accordion e só um fica aberto por vez: o que está em foco (o primeiro com algo
 * faltando ou para revisar; sem isso, o primeiro). É a mesma árvore para quem preenche (2.1, com "Editar") e para quem só confere (A).
 */
export function PainelContrato({
  grupos, pendencias = [], contrato, imovel, editavel = true, onEditar, onPersonalizar, quemPreencheu = 'Preenchido por você',
  titulo = 'O que vai no seu contrato', subtitulo = 'Resumo das respostas e do que o sistema sugere. O texto completo das cláusulas só aparece no documento final.', painelRef, levarAPendencia = 0, focoEm, selecao, abaixoDaLegenda, onComentar,
}: PainelContratoProps) {
  const interno = useRef<HTMLDivElement>(null);
  const pontosDoImovel = pontosPadraoDoImovel(imovel, contrato);
  const personalizados = pontosDoImovel.filter(p => pontoPersonalizado(p, contrato)).length;

  const visiveis = grupos.filter(g => editavel || g.itens.length > 0);
  const ids = [...visiveis.map(g => g.id), 'padrao'];
  const faltasDe = (id: string) => pendencias.filter(p => GRUPO_DA_PAGINA[p.pagina] === id);
  const comFalta = visiveis.findIndex(g => faltasDe(g.id).length > 0);
  const doEditado = focoEm ? visiveis.findIndex(g => g.id === GRUPO_DA_PAGINA[paginaDoItem(focoEm)]) : -1;
  const emFoco = comFalta >= 0 ? comFalta : doEditado >= 0 ? doEditado : Math.max(0, visiveis.findIndex(g => g.estado === 'atencao'));
  const [abertos, setAbertos] = useState<number[]>([emFoco]);

  // ao voltar da edição de um item (sem pendências): leva o foco à linha dele, para ver como ficou
  useEffect(() => {
    if (!focoEm || comFalta >= 0) return;
    const espera = window.setTimeout(() => {
      const linha = (painelRef ?? interno).current?.querySelector<HTMLElement>(`[data-itens~="${focoEm}"]`);
      linha?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      focarSeTeclado(linha);
    }, 450);
    return () => window.clearTimeout(espera);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Seguir" com algo faltando: abre o assunto da primeira pendência e leva o foco até o botão dela
  useEffect(() => {
    if (levarAPendencia === 0) return;
    const alvo = ids.indexOf(pendencias.length ? GRUPO_DA_PAGINA[pendencias[0].pagina] : '');
    if (alvo >= 0) setAbertos([alvo]);
    const espera = window.setTimeout(() => {
      const botao = (painelRef ?? interno).current?.querySelector<HTMLElement>('[data-pendente] button');
      botao?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      focarSeTeclado(botao);
    }, 400);
    return () => window.clearTimeout(espera);
  }, [levarAPendencia]); // eslint-disable-line react-hooks/exhaustive-deps

  const ids_ = ids;
  const comentar = (item: ItemSelecionavel) => !selecao && onComentar && (
    <Button variant="ghost" size="sm" iconOnly iconLeft={<MessageSquareText size={16} />} className={styles.comentar} aria-label={`Comentar este ponto: ${item.texto}`} onClick={() => onComentar(item)} />
  );
  const lista = (g: ResumoGrupo) => (
    <>
      {g.estado === 'atencao' && g.aviso && <p className={styles.aviso}>{g.aviso}</p>}
      <ul className={styles.lista}>
        {/* respostas que se leem melhor juntas viram uma frase só (a seta de editar leva ao primeiro campo do grupo) */}
        {frasesDoGrupo(g.itens).map(({ id, ids, frase }, i) => (
          <li key={id ?? frase} className={styles.item}>
            {selecao ? (
              <Selecionavel selecao={selecao} item={{ chave: `${g.id}:${id ?? frase}`, secao: g.titulo, texto: frase, ordem: ids_.indexOf(g.id) * 1000 + i }}>
                <span className={styles.frase}>{frase}</span>
              </Selecionavel>
            ) : editavel && onEditar && id ? (
              <button type="button" className={styles.linha} aria-label="Editar" data-itens={ids.join(' ')} aria-describedby={`frase-${g.id}-${id}`} onClick={() => onEditar(g.id, id)}>
                <span className={styles.frase} id={`frase-${g.id}-${id}`}>{frase}</span>
                <Pencil className={styles.lapis} size={16} aria-hidden="true" />
              </button>
            ) : (
              <p className={styles.frase}>{frase}</p>
            )}
            {comentar({ chave: `${g.id}:${id ?? frase}`, secao: g.titulo, texto: frase, ordem: ids_.indexOf(g.id) * 1000 + i })}
          </li>
        ))}
        {editavel && faltasDe(g.id).map(f => (
          <li key={`${f.pagina}-${f.item}`} className={styles.item} data-pendente="true">
            <p className={styles.falta}>
              <AlertCircle className={styles.faltaIcone} size={20} aria-hidden="true" />
              <span>{f.titulo}{': '}{f.item?.endsWith('-conjuge') ? 'faltam os dados' : f.vazia ? 'ainda não preenchido' : f.faltam === 1 ? 'falta 1 resposta' : `faltam ${f.faltam} respostas`}</span>
            </p>
            {onEditar && <Button variant="outline" onClick={() => onEditar(g.id, f.item ?? PRIMEIRO_ITEM[g.id])}>{f.vazia ? 'Preencher' : 'Completar'}</Button>}
          </li>
        ))}
      </ul>
    </>
  );

  const padrao = (
    <>
      <p className={styles.aviso}>
        {editavel
          ? 'O contrato já inclui cláusulas padrão para alguns assuntos, sem precisar de perguntas adicionais. Confira como ficaram e personalize se necessário.'
          : 'Estes assuntos não foram perguntados: o contrato já traz as cláusulas padrão.'}
      </p>
      {GRUPOS_PADRAO.map(sub => {
        const pontos = pontosDoImovel.filter(p => p.grupo === sub.id);
        if (pontos.length === 0) return null;
        return (
          <div key={sub.id} className={styles.subgrupo}>
            <h4 className={styles.subtitulo}>{sub.titulo}<span className={styles.contagem}>{pontos.length === 1 ? '1 ponto' : `${pontos.length} pontos`}</span></h4>
            <ul className={styles.lista}>
              {pontos.map(ponto => {
                const proprio = pontoPersonalizado(ponto, contrato);
                const escrito = proprio && contrato[ponto.id] === OUTRO;
                const rotulo = (
                  <span className={styles.rotulo}>
                    {ponto.titulo} {proprio ? <Badge status="brand">{escrito ? 'Escrito por quem preencheu' : 'Personalizado'}</Badge> : <Badge status="neutral">Cláusula padrão</Badge>}
                  </span>
                );
                return (
                  <li key={ponto.id} className={styles.item}>
                    {selecao ? (
                      <Selecionavel selecao={selecao} item={{ chave: `padrao:${ponto.id}`, secao: 'Cláusulas padrão', texto: frasePonto(ponto, contrato), ordem: ids_.indexOf('padrao') * 1000 + pontosDoImovel.indexOf(ponto) }}>
                        <span className={styles.itemTexto}>
                          {rotulo}
                          <span className={styles.frase}>{frasePonto(ponto, contrato)}</span>
                        </span>
                      </Selecionavel>
                    ) : editavel && onPersonalizar ? (
                      <button type="button" className={styles.linha} aria-label={`Personalizar: ${ponto.titulo}`} aria-describedby={`frase-${ponto.id}`} onClick={() => onPersonalizar(ponto)}>
                        <span className={styles.itemTexto}>
                          {rotulo}
                          <span className={styles.frase} id={`frase-${ponto.id}`}>{frasePonto(ponto, contrato)}</span>
                        </span>
                        <Pencil className={styles.lapis} size={16} aria-hidden="true" />
                      </button>
                    ) : (
                      <div className={styles.itemTexto}>
                        {rotulo}
                        <p className={styles.frase}>{frasePonto(ponto, contrato)}</p>
                      </div>
                    )}
                    {comentar({ chave: `padrao:${ponto.id}`, secao: 'Cláusulas padrão', texto: frasePonto(ponto, contrato), ordem: ids_.indexOf('padrao') * 1000 + pontosDoImovel.indexOf(ponto) })}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );

  // no modo de seleção, o assunto fechado diz quantas informações dele estão marcadas
  const marcadasEm = (grupo: string) => {
    const n = selecao ? selecao.escolhidos.filter(c => c.startsWith(`${grupo}:`)).length : 0;
    return n === 0 ? '' : n === 1 ? '1 selecionada' : `${n} selecionadas`;
  };

  const itens = [
    ...visiveis.map(g => {
      const faltas = faltasDe(g.id);
      const n = frasesDoGrupo(g.itens).length;
      return {
        title: g.titulo,
        icon: <IconeGrupo id={g.id} />,
        collapsedMeta: marcadasEm(g.id) ? <Badge status="brand">{marcadasEm(g.id)}</Badge> : faltas.length > 0 ? <Badge status="warning">Falta preencher</Badge> : g.estado === 'atencao' ? <Badge status="warning">Revisar</Badge> : undefined,
        meta: n > 0 ? (n === 1 ? '1 item' : `${n} itens`) : undefined,
        content: lista(g),
      };
    }),
    {
      title: 'Cláusulas padrão',
      icon: <IconeGrupo id="padrao" />,
      tightContent: true,
      collapsedMeta: marcadasEm('padrao') ? <Badge status="brand">{marcadasEm('padrao')}</Badge> : personalizados > 0 ? <Badge status="brand">{personalizados === 1 ? '1 personalizado' : `${personalizados} personalizados`}</Badge> : undefined,
      meta: `${pontosDoImovel.length} pontos`,
      content: padrao,
    },
  ];

  return (
    <div className={cx(styles.painel, !!abaixoDaLegenda && styles.painelComConvite)} ref={painelRef ?? interno}>
      <div className={styles.painelTopo}>
        <h2 className={styles.h2}>{titulo}</h2>
        <p className={styles.painelSub}>{subtitulo}</p>
        <p className={styles.legenda}>
          <Badge status="brand">{quemPreencheu}</Badge>
          <Badge status="neutral">Sugerido pelo sistema</Badge>
        </p>
        {abaixoDaLegenda}
      </div>
      <Accordion items={itens} value={abertos} onValueChange={setAbertos} headingLevel={3} variant="lines" />
    </div>
  );
}

/** Uma informação com checkbox: a linha toda marca e desmarca, e a marcada ganha um fundo suave (a leitura continua igual). */
function Selecionavel({ selecao, item, children }: { selecao: SelecaoDoPainel; item: ItemSelecionavel; children: React.ReactNode }) {
  const marcado = selecao.escolhidos.includes(item.chave);
  return (
    <div className={cx(styles.selecao, marcado && styles.marcado)}>
      <Checkbox checked={marcado} onChange={() => selecao.onAlternar(item)} label={children} />
    </div>
  );
}

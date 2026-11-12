import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CircleX, Plus, Trash2 } from 'lucide-react';
import { Button, Checkbox, DatePicker, Dialog, Dropdown, Feedback, Input } from '../../index';
import { buscarEnderecoPorCep, formatarCep, formatarCpf } from '../PessoasEnvolvidas/formatos';
import { FormParte, UFS } from '../PessoasEnvolvidas/FormParte';
import { FluxoShell } from './FluxoShell';
import { anuenciasPendentes, comConjuge, conjugeCompleto, exigeAnuencia, papelPorExtenso, pessoasCasadas, validarConjuge, type PessoaCasada } from './anuencia';
import { useEdicaoDoResumo, SALVAR_E_VOLTAR } from './edicaoDoResumo';
import { irParaCampo, useFocoInicial } from './foco';
import { AjudaDoCampo } from './AjudaDoCampo';
import { AvisoDeErros, levarAoPrimeiroErro } from './AvisoDeErros';
import { GrupoOpcoes, OpcaoCard } from './OpcaoCard';
import {
  CAMPOS_ENDERECO, ESTADOS_DO_ITEM, erroDaPergunta, errosDoInventario, ITEM_VAZIO, lerInventario, type ItemInventario, formatarMoeda, formatarPercentual, lerParteDaResposta, opcoesVisiveis, PAGINA_POR_ID, perguntaVisivel, soNumeros,
  type PaginaFluxo, type Pergunta, type PerguntaCampo,
} from './perguntas';
import { construirResumo, paginaDoItem, TOTAL_PAGINAS } from './resumo';
import { CONJUGE_VAZIO, lerRespostas, salvarContrato, salvarRespostas, type Contrato, type DadosConjuge, type Imovel, type ParteResp, type Respostas } from './respostas';
import styles from './PaginaPerguntas.module.css';

export interface PaginaPerguntasProps {
  /** Qual página (5 a 9) mostrar. */
  pagina: PaginaFluxo;
  /** Respostas já dadas nesta tela (para mostrar a tela preenchida). Sem isso, usa a sessão do protótipo. */
  inicial?: Contrato;
  /** Tipo de imóvel escolhido na página 1 (decide, por exemplo, se pergunta do condomínio). Sem isso, usa a sessão. */
  imovel?: Imovel;
  /** Já mostra os erros de preenchimento (como depois de tentar seguir). */
  mostrarErros?: boolean;
  /** Lembra as respostas ao ir e voltar entre as telas do protótipo (sessão do navegador). */
  persistir?: boolean;
  /** Pessoas envolvidas (para as stories). Sem isso, usa a sessão. Servem para saber quem é casado(a) quando o prazo é de 10 anos ou mais. */
  pessoas?: Pick<Respostas, 'locador' | 'locatario'>;
  /** Texto do botão que segue (a última página muda para "Revisar o contrato"). */
  textoSeguinte?: string;
  /** Volta à revisão (quando a pessoa chegou pelo "Editar" dela). Com isso, "Seguinte" vira "Salvar e voltar ao resumo". */
  onVoltarAoResumo?: () => void;
  onSair?: () => void;
  onVoltar?: () => void;
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  onSeguinte?: () => void;
}

const UFS_OPCOES = UFS;

/**
 * Páginas 5 a 9 do preenchimento (dados do imóvel, valores, usar e conviver, reparos e obras, saída e garantias).
 * É uma só tela, montada a partir de `perguntas.tsx`: perguntas de escolha viram cards, as demais viram campos. Algumas
 * perguntas só aparecem conforme respostas anteriores. Tudo o que é respondido é guardado na hora e aparece no resumo,
 * onde cada item leva de volta à pergunta.
 */
export function PaginaPerguntas({ onVoltarAoResumo, pagina, inicial, imovel, mostrarErros = false, persistir = true, pessoas, textoSeguinte = 'Seguinte', onSair, onVoltar, onIrParaSecao, onSeguinte }: PaginaPerguntasProps) {
  const def = PAGINA_POR_ID[pagina];
  const doResumo = useEdicaoDoResumo(pagina) && !!onVoltarAoResumo;
  const sessao = useMemo(() => (persistir ? lerRespostas() : {}), [persistir]);
  const [valores, setValores] = useState<Contrato>({ ...sessao.contrato, ...inicial });
  const [tentou, setTentou] = useState(mostrarErros);
  const [tentativa, setTentativa] = useState(0);
  const [tocados, setTocados] = useState<Set<string>>(new Set());
  // campos que a pessoa está digitando agora: o erro só aparece (ou muda) quando ela sai do campo
  const [editando, setEditando] = useState<Set<string>>(new Set());
  const raiz = useRef<HTMLDivElement>(null);
  useFocoInicial(raiz);

  const tipoImovel = imovel ?? sessao.imovel;
  const ctx = { imovel: tipoImovel };
  const visiveis = def.perguntas.filter(p => perguntaVisivel(p, valores, ctx));
  const erros = visiveis.filter(p => erroDaPergunta(p, valores));
  // prazo de 120 meses ou mais: cada pessoa casada(o) precisa dos dados do cônjuge (verificado pessoa a pessoa)
  // os dados do cônjuge anuente se preenchem numa janela aqui mesmo (a pessoa não sai da página); ficam guardados na pessoa e aparecem no resumo
  const [conjuges, setConjuges] = useState<Record<string, DadosConjuge>>({});
  const [anuenteAberto, setAnuenteAberto] = useState<PessoaCasada | null>(null);
  const comAnuentes = (parte: ParteResp | undefined, prefixo: string) => Object.entries(conjuges).reduce((p, [id, c]) => (id.startsWith(prefixo) ? comConjuge(p, id, c) : p), parte);
  const locador = comAnuentes(pessoas?.locador ?? sessao.locador, 'dono');
  const locatario = comAnuentes(pessoas?.locatario ?? sessao.locatario, 'inq');
  const salvarConjuge = (p: PessoaCasada, dados: DadosConjuge) => {
    setConjuges(c => ({ ...c, [p.id]: dados }));
    if (persistir) {
      const parte = comConjuge(lerRespostas()[p.papel], p.id, dados);
      if (parte) salvarRespostas(p.papel === 'locador' ? { locador: parte } : { locatario: parte });
    }
    setAnuenteAberto(null);
  };
  const casadas = pagina === 'valores' && exigeAnuencia(valores) ? pessoasCasadas(locador, locatario) : [];
  const qtdErros = erros.length + anuenciasPendentes(valores, locador, locatario).length;
  // junta campos digitados que aparecem em sequência; escolhas em cards e o endereço ficam sozinhos
  type Bloco = { secao?: string; secaoAjuda?: string; subsecao?: string; campos?: PerguntaCampo[]; pergunta?: Pergunta };
  const blocos = visiveis.reduce<Bloco[]>((acc, p) => {
    if (p.tipo === 'opcoes' || p.tipo === 'multi' || p.tipo === 'endereco' || p.tipo === 'parte' || p.tipo === 'inventario') return [...acc, { secao: p.secao, secaoAjuda: p.secaoAjuda, subsecao: p.subsecao, pergunta: p }];
    const ultimo = acc[acc.length - 1];
    if (ultimo?.campos && !p.secao && !p.subsecao) ultimo.campos.push(p);
    else acc.push({ secao: p.secao, secaoAjuda: p.secaoAjuda, subsecao: p.subsecao, campos: [p] });
    return acc;
  }, []);

  // páginas com `agruparSecoes`: cada seção reúne o seu título e as perguntas que vêm até a próxima seção
  const secoes = blocos.reduce<Array<{ titulo?: string; ajuda?: string; blocos: Bloco[] }>>((acc, b) => {
    if (b.secao || acc.length === 0) acc.push({ titulo: b.secao, ajuda: b.secaoAjuda, blocos: [b] });
    else acc[acc.length - 1].blocos.push(b);
    return acc;
  }, []);

  // marcar ou desmarcar uma opção de "marque várias". O que for marcado aqui sai das perguntas que não o repetem.
  const alternar = (p: Pergunta, valor: string) => setValores(v => {
    const atual = (v[p.id] ?? '').split(',').filter(Boolean);
    const novo = { ...v, [p.id]: (atual.includes(valor) ? atual.filter(x => x !== valor) : [...atual, valor]).join(',') };
    for (const q of def.perguntas) {
      if (q.tipo === 'multi' && q.excluirDe === p.id) novo[q.id] = (novo[q.id] ?? '').split(',').filter(x => x && x !== valor).join(',');
    }
    return novo;
  });

  // guarda a cada mudança: voltar pelo resumo ou por outra página nunca perde o que já foi preenchido
  useEffect(() => { if (persistir) salvarContrato(valores); }, [persistir, valores]);

  const mudar = (id: string, valor: string) => { setEditando(e => (e.has(id) ? e : new Set(e).add(id))); setValores(v => ({ ...v, [id]: valor })); };
  const tocar = (id: string) => { setEditando(e => { if (!e.has(id)) return e; const n = new Set(e); n.delete(id); return n; }); setTocados(t => new Set(t).add(id)); };
  const erroDe = (p: Pergunta) => ((tentou || tocados.has(p.id)) && !editando.has(p.id) ? erroDaPergunta(p, valores) : undefined);

  const seguir = () => {
    setTentou(true);
    if (qtdErros > 0) {
      setTentativa(n => n + 1);
      levarAoPrimeiroErro(raiz.current);
      return;
    }
    (doResumo ? onVoltarAoResumo : onSeguinte)?.();
  };

  const resumo = construirResumo({
    atual: def.grupo,
    uso: sessao.uso,
    imovel: tipoImovel,
    locador,
    locatario,
    administracao: sessao.administracao,
    imobiliaria: sessao.imobiliaria,
    usoAoPreencherLocador: sessao.usoAoPreencherLocador,
    contrato: valores,
  });

  const irPara = (grupo: string, item?: string) => {
    if (paginaDoItem(item) === pagina) { irParaCampo(raiz.current, item); return; }
    onIrParaSecao?.(grupo, item);
  };

  /** As opções de uma pergunta de marcar várias que ainda podem ser escolhidas (sem as já marcadas na pergunta de `excluirDe`). */
  const opcoesDisponiveis = (p: Extract<Pergunta, { tipo: 'multi' }>) => p.opcoes.filter(o => !p.excluirDe || !(valores[p.excluirDe] ?? '').split(',').includes(o.valor));

  /** Um bloco de perguntas. `comSecao`: mostra o título da seção aqui (nas páginas que agrupam seções, o título vem do grupo). */
  const renderBloco = (bloco: Bloco, comSecao: boolean) => bloco.campos ? (
    // campos seguidos ficam juntos numa grade, com o mesmo espaço entre campos da página 1.2
    <Fragment key={bloco.campos[0].id}>
      <div className={[styles.pergunta, bloco.campos[0].colado && styles.colada].filter(Boolean).join(' ')}>
        {comSecao && bloco.secao && <h2 className={styles.h2}>{bloco.secao}</h2>}
        {bloco.subsecao && <h3 className={styles.h3}>{bloco.subsecao}</h3>}
        <div className={styles.grade}>
          {bloco.campos.map(p => (
            <div key={p.id} data-foco={p.id} data-invalido={erroDe(p) ? 'true' : undefined}>
              <Campo p={p} valor={valores[p.id] ?? ''} erro={erroDe(p)} onChange={v => mudar(p.id, v)} onBlur={() => tocar(p.id)} />
            </div>
          ))}
        </div>
      </div>
      {/* prazo de 10 anos ou mais: logo abaixo do prazo, quem é casado(a) precisa dos dados do cônjuge anuente */}
      {casadas.length > 0 && bloco.campos.some(p => p.id === 'va-prazo') && (
        <AnuenciaDoPrazo pessoas={casadas} tentou={tentou} onInformar={setAnuenteAberto} />
      )}
    </Fragment>
  ) : [bloco.pergunta as Pergunta].map(p => (
    <div key={p.id} className={styles.pergunta}>
      {comSecao && bloco.secao && <h2 className={styles.h2}>{bloco.secao}</h2>}
      {comSecao && bloco.secao && bloco.secaoAjuda && <p className={styles.lead}>{bloco.secaoAjuda}</p>}
      {bloco.subsecao && <h3 className={styles.h3}>{bloco.subsecao}</h3>}
      <div data-foco={p.id} data-invalido={erroDe(p) ? 'true' : undefined}>
        {p.tipo === 'parte' && (
          <FormParte papel={p.papel} dados={lerParteDaResposta(valores, p.id)} onChange={d => mudar(p.id, JSON.stringify(d))} tentou={tentou} foco={`${p.id}-dados`} />
        )}
        {p.tipo === 'multi' && (
          <GrupoOpcoes legenda={p.legenda} ajuda={p.ajuda} colunas={2} curtas>
            {opcoesDisponiveis(p).map(o => (
              <Checkbox key={o.valor} label={o.titulo} checked={(valores[p.id] ?? '').split(',').includes(o.valor)} onChange={() => alternar(p, o.valor)} />
            ))}
          </GrupoOpcoes>
        )}
        {p.tipo === 'opcoes' && (
          <GrupoOpcoes legenda={p.legenda} ajuda={p.ajuda} colunas={p.colunas ?? 2} curtas={p.curtas} erro={erroDe(p)}>
            {opcoesVisiveis(p.opcoes, valores).map(o => (
              <OpcaoCard key={o.valor} name={p.id} value={o.valor} checked={valores[p.id] === o.valor} onChange={v => mudar(p.id, v)} icone={o.icone} titulo={o.titulo} descricao={o.descricao} />
            ))}
          </GrupoOpcoes>
        )}
        {p.tipo === 'inventario' && <InventarioDoImovel ajuda={p.ajuda} valores={valores} id={p.id} onChange={v => mudar(p.id, v)} tentou={tentou} />}
        {p.tipo === 'endereco' && <EnderecoDoImovel titulo={p.titulo} valores={valores} onChange={setValores} tentou={tentou} />}
      </div>
    </div>
  ));

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={0} pagina={{ atual: def.numero, total: TOTAL_PAGINAS }} resumo={resumo} onSair={onSair} onIrParaSecao={irPara}>
      <div className={styles.pagina} ref={raiz}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>{def.titulo}</h1>
          <p className={styles.lead}>{def.lead}</p>
        </header>

        {def.explicacao && <Feedback type="info" title={def.explicacao.titulo} message={def.explicacao.texto} />}

        {def.agruparSecoes
          ? secoes.map((sec, i) => (
            <section key={i} className={styles.secaoPagina} aria-labelledby={sec.titulo ? `secao-${def.id}-${i}` : undefined}>
              {sec.titulo && (
                // título e subtítulo da seção ficam juntos, com o mesmo espaço entre título e subtítulo da página
                <div className={styles.intro}>
                  <h2 id={`secao-${def.id}-${i}`} className={styles.h2}>{sec.titulo}</h2>
                  {sec.ajuda && <p className={styles.lead}>{sec.ajuda}</p>}
                </div>
              )}
              <div className={styles.blocosDaSecao}>
                {sec.blocos.map(b => renderBloco(b, false))}
              </div>
            </section>
          ))
          : blocos.map(b => renderBloco(b, true))}

        <AvisoDeErros tentativa={tentativa} quantidade={qtdErros} />

        {def.rodape && (def.rodape.discreto
          ? <p className={styles.notaFinal}>{def.rodape.texto}</p>
          : <Feedback type="info" title={def.rodape.titulo} message={def.rodape.texto} />)}

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={onVoltar}>Voltar</Button>
          <Button iconRight={doResumo ? undefined : <ArrowRight size={20} />} onClick={seguir}>{doResumo ? SALVAR_E_VOLTAR : textoSeguinte}</Button>
        </div>
      </div>
      <ModalConjuge pessoa={anuenteAberto} onFechar={() => setAnuenteAberto(null)} onSalvar={salvarConjuge} />
    </FluxoShell>
  );
}

/**
 * Prazo de 10 anos ou mais: lista, pessoa a pessoa, quem é casado(a) e se os dados do cônjuge anuente já foram informados.
 * Dados já informados são reaproveitados; os que faltam levam à página da pessoa (em Pessoas envolvidas), e de lá dá para
 * voltar ao prazo sem perder nada. Os textos e a regra precisam de validação jurídica.
 */
/** Janela para informar (ou editar) o cônjuge anuente de uma pessoa casada, sem sair da página do prazo. */
function ModalConjuge({ pessoa, onFechar, onSalvar }: { pessoa: PessoaCasada | null; onFechar: () => void; onSalvar: (p: PessoaCasada, dados: DadosConjuge) => void }) {
  const [dados, setDados] = useState<DadosConjuge>(CONJUGE_VAZIO);
  const [tentou, setTentou] = useState(false);
  useEffect(() => { if (pessoa) { setDados(pessoa.dados.conjuge ?? CONJUGE_VAZIO); setTentou(false); } }, [pessoa]);
  const erros = validarConjuge(dados);
  const mostrar = (c: keyof DadosConjuge) => (tentou ? erros[c] : undefined);
  const primeiroNome = pessoa?.nome.split(/\s+/)[0] ?? '';
  const salvar = () => {
    setTentou(true);
    if (pessoa && Object.keys(erros).length === 0) onSalvar(pessoa, dados);
  };
  const mudar = (c: keyof DadosConjuge, v: string) => setDados(d => ({ ...d, [c]: v }));
  return (
    <Dialog
      open={pessoa !== null}
      onClose={onFechar}
      title={`Cônjuge anuente de ${primeiroNome}`}
      subtitle="Ele assina como anuente, não como proprietário nem como quem está alugando."
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={salvar}>Salvar</Button>
        </>
      }
    >
      <div className={styles.modalConjuge}>
        <Input label="Nome completo do cônjuge" value={dados.nome} autoComplete="off" error={mostrar('nome')} onChange={e => mudar('nome', e.target.value)} />
        <Input label="CPF do cônjuge" value={dados.documento} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" error={mostrar('documento')} onChange={e => mudar('documento', formatarCpf(e.target.value))} />
        <Input label="Nacionalidade" value={dados.nacionalidade} autoComplete="off" error={mostrar('nacionalidade')} onChange={e => mudar('nacionalidade', e.target.value)} />
        <Input label="Profissão" value={dados.profissao} autoComplete="off" error={mostrar('profissao')} onChange={e => mudar('profissao', e.target.value)} />
      </div>
    </Dialog>
  );
}

function AnuenciaDoPrazo({ pessoas, tentou, onInformar }: { pessoas: PessoaCasada[]; tentou: boolean; onInformar: (p: PessoaCasada) => void }) {
  return (
    <section className={styles.pergunta} aria-label="Cônjuge anuente">
      <h3 className={styles.h3}>Cônjuge anuente</h3>
      <p className={styles.anuenciaTexto}>
        Como o contrato tem prazo de 10 anos ou mais, precisamos dos dados do cônjuge de quem é casado(a), para a autorização do contrato.
        O cônjuge assina como anuente, não como proprietário nem como quem está alugando.
      </p>
      <ul className={styles.anuentes}>
        {pessoas.map(p => {
          const ok = conjugeCompleto(p.dados.conjuge);
          const erro = tentou && !ok;
          return (
            <li key={p.id} className={styles.anuente} data-foco={`${p.id}-conjuge-aviso`} data-invalido={erro ? 'true' : undefined}>
              <div className={styles.anuenteTexto}>
                <p className={styles.anuenteNome}>{p.nome} <span>({papelPorExtenso(p.id)})</span></p>
                <p className={styles.anuenteEstado}>
                  {ok ? `Dados do cônjuge já informados: ${p.dados.conjuge?.nome.trim()}.` : 'Os dados do cônjuge ainda não foram informados.'}
                </p>
                {erro && <p className={styles.anuenteErro} aria-live="polite"><CircleX size={14} aria-hidden="true" />Informe os dados do cônjuge para seguir.</p>}
              </div>
              <Button variant={ok ? 'ghost' : 'outline'} onClick={() => onInformar(p)}>{ok ? 'Ver ou editar os dados' : 'Informar dados do cônjuge'}</Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Campo({ p, valor, erro, onChange, onBlur }: { p: PerguntaCampo; valor: string; erro?: string; onChange: (v: string) => void; onBlur: () => void }) {
  if (p.tipo === 'data') {
    return <DatePicker label={p.label} helperText={p.ajuda} value={valor} onChange={v => { onChange(v); onBlur(); }} error={erro} />;
  }
  const comum = {
    label: p.label, helperText: p.ajuda, optional: p.opcional, error: erro, onBlur, autoComplete: 'off' as const,
    labelAction: p.dica ? <AjudaDoCampo titulo={p.dica.titulo} texto={p.dica.texto} rotuloDoBotao={`Ajuda: ${p.label}`} /> : undefined,
  };
  if (p.tipo === 'moeda') return <Input {...comum} value={valor} inputMode="numeric" placeholder={p.placeholder} onChange={e => onChange(formatarMoeda(e.target.value))} />;
  if (p.tipo === 'percentual') return <Input {...comum} value={valor} inputMode="decimal" placeholder={p.placeholder} onChange={e => onChange(formatarPercentual(e.target.value))} />;
  if (p.tipo === 'numero') return <Input {...comum} value={valor} inputMode="numeric" placeholder={p.placeholder} onChange={e => onChange(soNumeros(e.target.value).slice(0, 3))} />;
  return <Input {...comum} value={valor} placeholder={p.placeholder} onChange={e => onChange(e.target.value)} />;
}

/** Endereço do imóvel: o CEP completo preenche rua, bairro, cidade e estado (os campos continuam editáveis). */
/** Lista de itens do inventário: cada linha tem o item, a quantidade e o estado. Começa com uma linha e cresce com "Adicionar item". */
function InventarioDoImovel({ ajuda, valores, id, onChange, tentou }: { ajuda?: string; valores: Contrato; id: string; onChange: (json: string) => void; tentou: boolean }) {
  const itens = lerInventario(valores, id);
  const erros = errosDoInventario(itens);
  const salvar = (novos: ItemInventario[]) => onChange(JSON.stringify(novos));
  const mudarItem = (i: number, parte: Partial<ItemInventario>) => salvar(itens.map((x, j) => (j === i ? { ...x, ...parte } : x)));
  return (
    <div className={styles.inventario}>
      {ajuda && <p className={styles.ajuda}>{ajuda}</p>}
      {itens.map((x, i) => {
        const e = tentou ? erros.linhas[i] : {};
        const erroItem = e.item ?? (tentou && i === 0 && erros.geral ? erros.geral : undefined);
        return (
          <div key={i} className={styles.itemInventario} role="group" aria-label={`Item ${i + 1}`} data-invalido={erroItem || e.qtd ? 'true' : undefined}>
            <div className={styles.itemInventarioCampos}>
              <Input label="Item" value={x.item} autoComplete="off" placeholder="Ex.: geladeira, sofá, fogão" error={erroItem} onChange={ev => mudarItem(i, { item: ev.target.value })} />
              <Input label="Quantidade" value={x.qtd} inputMode="numeric" autoComplete="off" error={e.qtd} onChange={ev => mudarItem(i, { qtd: ev.target.value.replace(/\D/g, '').slice(0, 3) })} />
              <Dropdown label="Estado" optional options={ESTADOS_DO_ITEM} value={x.estado || undefined} onChange={v => mudarItem(i, { estado: v })} />
            </div>
            {itens.length > 1 && (
              <Button variant="ghost" iconOnly iconLeft={<Trash2 size={20} />} aria-label={`Remover o item ${i + 1}`} onClick={() => salvar(itens.filter((_, j) => j !== i))} />
            )}
          </div>
        );
      })}
      <Button variant="outline" iconLeft={<Plus size={20} />} onClick={() => salvar([...itens, { ...ITEM_VAZIO }])}>Adicionar item</Button>
    </div>
  );
}

function EnderecoDoImovel({ titulo, valores, onChange, tentou }: { titulo: string; valores: Contrato; onChange: (fn: (v: Contrato) => Contrato) => void; tentou: boolean }) {
  const [status, setStatus] = useState<'ocioso' | 'buscando' | 'nao-achou' | 'falhou'>('ocioso');
  const busca = useRef<AbortController | null>(null);
  useEffect(() => () => busca.current?.abort(), []);
  const [tocados, setTocados] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState<Set<string>>(new Set());
  const v = (c: string) => valores[c] ?? '';
  const campo = (c: (typeof CAMPOS_ENDERECO)[number], msg: string, vazio = (x: string) => !x.trim()) => (tentou || tocados.has(c)) && !editando.has(c) && vazio(v(c)) ? msg : undefined;
  const set = (c: string, valor: string) => { setEditando(e => (e.has(c) ? e : new Set(e).add(c))); onChange(x => ({ ...x, [c]: valor })); };
  const tocar = (c: string) => { setEditando(e => { if (!e.has(c)) return e; const n = new Set(e); n.delete(c); return n; }); setTocados(t => new Set(t).add(c)); };

  const mudarCep = (valor: string) => {
    const cep = formatarCep(valor);
    set('im-cep', cep);
    busca.current?.abort();
    if (soNumeros(cep).length !== 8) { setStatus('ocioso'); return; }
    const ctrl = new AbortController();
    busca.current = ctrl;
    setStatus('buscando');
    buscarEnderecoPorCep(cep, ctrl.signal)
      .then(end => {
        if (ctrl.signal.aborted) return;
        if (!end) { setStatus('nao-achou'); return; }
        setStatus('ocioso');
        onChange(x => ({ ...x, 'im-cep': cep, 'im-logradouro': end.logradouro, 'im-bairro': end.bairro, 'im-cidade': end.cidade, 'im-uf': end.uf }));
      })
      .catch(() => { if (!ctrl.signal.aborted) setStatus('falhou'); });
  };
  const ajudaCep = status === 'buscando' ? 'Buscando o endereço…' : status === 'nao-achou' ? 'Não encontramos este CEP. Preencha o endereço abaixo' : status === 'falhou' ? 'Não foi possível buscar o endereço agora. Preencha abaixo' : 'Ao digitar o CEP, preenchemos as informações ligadas a ele';
  const props = (c: (typeof CAMPOS_ENDERECO)[number], msg: string) => ({ value: v(c), error: campo(c, msg), onBlur: () => tocar(c), onChange: (e: { target: { value: string } }) => set(c, e.target.value), autoComplete: 'off' as const });
  const invalido = (c: (typeof CAMPOS_ENDERECO)[number], msg: string) => (campo(c, msg) ? 'true' : undefined);

  return (
    <section className={styles.secao} aria-label={titulo}>
      <h2 className={styles.h2}>{titulo}</h2>
      <div className={styles.grade}>
        <div data-invalido={(tentou || tocados.has('im-cep')) && !editando.has('im-cep') && soNumeros(v('im-cep')).length !== 8 ? 'true' : undefined}>
          <Input label="CEP" value={v('im-cep')} inputMode="numeric" autoComplete="off" placeholder="00000-000" helperText={ajudaCep}
            error={(tentou || tocados.has('im-cep')) && !editando.has('im-cep') && soNumeros(v('im-cep')).length !== 8 ? 'Informe o CEP com 8 números.' : undefined}
            onBlur={() => tocar('im-cep')} onChange={e => mudarCep(e.target.value)} />
        </div>
        <div className={styles.cheio} data-invalido={invalido('im-logradouro', 'Informe a rua ou avenida.')}>
          <Input label="Rua ou avenida" {...props('im-logradouro', 'Informe a rua ou avenida.')} />
        </div>
        <div data-invalido={invalido('im-numero', 'Informe o número (ou "s/n").')}>
          <Input label="Número" {...props('im-numero', 'Informe o número (ou "s/n").')} />
        </div>
        <div>
          <Input label="Complemento" optional value={v('im-complemento')} autoComplete="off" onChange={e => set('im-complemento', e.target.value)} />
        </div>
        <div data-invalido={invalido('im-bairro', 'Informe o bairro.')}>
          <Input label="Bairro" {...props('im-bairro', 'Informe o bairro.')} />
        </div>
        <div data-invalido={invalido('im-cidade', 'Informe a cidade.')}>
          <Input label="Cidade" {...props('im-cidade', 'Informe a cidade.')} />
        </div>
        <div data-invalido={invalido('im-uf', 'Escolha o estado.')}>
          <Dropdown label="Estado" options={UFS_OPCOES} value={v('im-uf') || undefined} onChange={x => { set('im-uf', x); tocar('im-uf'); }} error={campo('im-uf', 'Escolha o estado.')} />
        </div>
      </div>
    </section>
  );
}

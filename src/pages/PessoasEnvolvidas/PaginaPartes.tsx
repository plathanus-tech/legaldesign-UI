import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Plus, User, Users, X } from 'lucide-react';
import { Button, Feedback } from '../../index';
import { FluxoShell } from '../fluxo/FluxoShell';
import { irParaCampo, useFocoInicial } from '../fluxo/foco';
import { casadoEmComunhaoUniversal, exigeAnuencia, PRAZO_ANUENCIA_MESES, qtdErrosConjuge } from '../fluxo/anuencia';
import { useEdicaoDoResumo, SALVAR_E_VOLTAR } from '../fluxo/edicaoDoResumo';
import { lerRetorno, limparRetorno, focarSeTeclado } from '../fluxo/foco';
import { AvisoDeErros, levarAoPrimeiroErro } from '../fluxo/AvisoDeErros';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import { construirResumo, paginaDoItem, TOTAL_PAGINAS } from '../fluxo/resumo';
import { lerRespostas, LOCADOR_VAZIO, PARTE_VAZIA, salvarRespostas, type Administracao, type DadosLocador, type Imovel, type ParteResp, type Respostas, type Uso } from '../fluxo/respostas';
import { FormParte, SalvarDados, validarParte } from './FormParte';
import styles from './PessoasEnvolvidas.module.css';

type Papel = 'locador' | 'locatario';

export interface TextosPagina {
  pagina: 2 | 4;
  titulo: string;
  lead: string;
  maisLegenda: string;
  /** Botão para incluir mais uma pessoa, a ajuda que o acompanha e o botão de tirar a segunda. */
  adicionar: string;
  adicionarAjuda: string;
  remover: string;
  /** Título do bloco da segunda pessoa. */
  tituloSegundo: string;
  umDescricao: string;
  maisDescricao: string;
  regraLegenda: string;
  regraSim: { titulo: string; descricao: string };
  regraNao: { titulo: string; descricao: string };
  foco: { um: string; dois: string; mais: string; regra: string };
  paginaId: 'dono' | 'inquilino';
}

export const TEXTOS: Record<Papel, TextosPagina> = {
  locador: {
    pagina: 2,
    paginaId: 'dono',
    titulo: 'Quem está oferecendo o imóvel para aluguel?',
    lead: 'Informe os dados do proprietário ou de quem o representa. Se houver uma imobiliária ou um corretor responsável pela locação, você poderá informar os dados em seguida.',
    maisLegenda: 'Haverá mais de um proprietário?',
    adicionar: 'Adicionar outro proprietário',
    adicionarAjuda: 'Se a matrícula do imóvel tiver mais de um proprietário, todos precisam estar no contrato: adicione cada um aqui. Pode ser o cônjuge ou qualquer outra pessoa.',
    remover: 'Remover o segundo proprietário',
    tituloSegundo: 'Dados do 2º proprietário',
    umDescricao: 'O imóvel tem um só proprietário.',
    maisDescricao: 'O imóvel tem mais de um proprietário.',
    regraLegenda: 'Como ficam as cobranças entre os proprietários?',
    regraSim: { titulo: 'Qualquer um pode cobrar tudo', descricao: 'Cada proprietário pode cobrar e dar recibo do valor total.' },
    regraNao: { titulo: 'Cada um cobra a sua parte', descricao: 'O valor é dividido entre os proprietários.' },
    foco: { um: 'dono', dois: 'dono2', mais: 'dono-mais', regra: 'dono-regra' },
  },
  locatario: {
    pagina: 4,
    paginaId: 'inquilino',
    titulo: 'Quem vai alugar o imóvel?',
    lead: 'Informe os dados de quem vai alugar: a pessoa que vai usar o imóvel ou que assina o contrato de locação.',
    maisLegenda: 'Haverá mais de uma pessoa alugando?',
    adicionar: 'Adicionar outra pessoa alugando',
    adicionarAjuda: 'Se mais de uma pessoa vai alugar, adicione a outra aqui.',
    remover: 'Remover o segunda pessoa alugando',
    tituloSegundo: 'Dados do 2ª pessoa alugando',
    umDescricao: 'Só uma pessoa ou empresa vai alugar.',
    maisDescricao: 'Mais de uma pessoa ou empresa vai alugar.',
    regraLegenda: 'Como ficam as responsabilidades entre as pessoas que estão alugando?',
    regraSim: { titulo: 'Todos respondem pelo total', descricao: 'Cada pessoa responde por todo o valor devido, não só pela sua parte.' },
    regraNao: { titulo: 'Cada um responde pela sua parte', descricao: 'O valor devido é dividido entre as pessoas que estão alugando.' },
    foco: { um: 'inq', dois: 'inq2', mais: 'inq-mais', regra: 'inq-regra' },
  },
};

export interface PaginaPartesProps {
  /** Qual parte desta página: o proprietário (locador, página 2) ou quem está alugando (locatário, página 3). */
  papel: Papel;
  /** Respostas já dadas nesta página (para mostrar a tela preenchida). Sem isso, usa a sessão do protótipo. */
  inicial?: Partial<ParteResp>;
  /** Respostas da página do imóvel, para o índice. */
  imovel?: { uso: Uso; imovel: Imovel };
  /** Respostas de outras páginas, para o índice. Sem isso, usa a sessão do protótipo. */
  outras?: Pick<Respostas, 'locador' | 'locatario' | 'administracao' | 'imobiliaria'>;
  /** Já mostra os erros de preenchimento (como depois de tentar seguir). */
  mostrarErros?: boolean;
  /** Lembra as respostas ao ir e voltar entre as telas do protótipo (sessão do navegador). */
  persistir?: boolean;
  onSair?: () => void;
  onVoltar?: () => void;
  onIrParaSecao?: (grupoId: string, itemId?: string) => void;
  /** Segue para a próxima página. Só é chamado com tudo preenchido. */
  onSeguinte?: (parte: ParteResp) => void;
  /** Prazo do contrato em meses (para as stories). Sem isso, usa o que está na sessão. Com 120 meses ou mais, os dados do cônjuge de quem é casado(a) são necessários. */
  prazoMeses?: number;
  /** Volta à página do prazo (quando a pessoa veio de lá para completar o cônjuge). */
  onVoltarAoPrazo?: () => void;
  /** Volta à revisão (quando a pessoa chegou pelo "Editar" dela). Com isso, "Seguinte" vira "Salvar e voltar ao resumo". */
  onVoltarAoResumo?: () => void;
}

/**
 * Páginas 2 e 3: proprietário (locador) e inquilino (locatário). As duas seguem o mesmo fluxo do cliente: dados da
 * primeira pessoa (pessoa ou empresa) → haverá mais de um? → se sim, dados da segunda e como ficam as
 * responsabilidades entre elas. Nada é apagado se a pessoa voltar atrás em "mais de um": o segundo cadastro só fica
 * escondido. A pergunta de quem administra o aluguel fica numa página própria (a seguir).
 */
export function PaginaPartes({ onVoltarAoResumo, papel, inicial, imovel, outras, mostrarErros = false, persistir = true, onSair, onVoltar, onIrParaSecao, onSeguinte, prazoMeses, onVoltarAoPrazo }: PaginaPartesProps) {
  const t = TEXTOS[papel];
  const sessao = useMemo(() => (persistir ? lerRespostas() : {}), [persistir]);
  const base = { ...PARTE_VAZIA, ...sessao[papel], ...inicial };
  const [principal, setPrincipal] = useState<DadosLocador>(base.principal);
  const [segundo, setSegundo] = useState<DadosLocador>(base.segundo);
  // terceira pessoa em diante: não há limite de proprietários nem de quem está alugando
  const [outros, setOutros] = useState<DadosLocador[]>(base.outros ?? []);
  const [maisDeUm, setMaisDeUm] = useState<boolean | null>(base.maisDeUm);
  const [compartilhado, setCompartilhado] = useState<boolean | null>(base.compartilhado);
  const [tentou, setTentou] = useState(mostrarErros);
  const [tentativa, setTentativa] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  useFocoInicial(formRef);

  const uso = sessao.uso ?? imovel?.uso;
  const tipoImovel = sessao.imovel ?? imovel?.imovel;
  const parte: ParteResp = { principal, segundo, outros, maisDeUm, compartilhado };

  // com prazo de 10 anos ou mais, o cônjuge de quem é casado(a) também é necessário
  const exige = prazoMeses !== undefined ? prazoMeses >= PRAZO_ANUENCIA_MESES : exigeAnuencia(sessao.contrato);
  // se a pessoa veio da página do prazo para completar o cônjuge, tem como voltar para lá
  const veioDoPrazo = useMemo(() => lerRetorno() !== null, []);
  const doResumo = useEdicaoDoResumo(papel === 'locador' ? 'dono' : 'inquilino') && !!onVoltarAoResumo && !veioDoPrazo;
  // comunhão universal de bens: o cônjuge também é proprietário (ou inquilino) e entra como mais uma pessoa, com todos os dados.
  // Quando alguém escolhe esse regime e não há outra pessoa na mesma situação, o bloco do cônjuge já é aberto, com o que se sabe preenchido.
  const pessoasDaParte = [principal, ...(maisDeUm === true ? [segundo, ...outros] : [])];
  const universais = pessoasDaParte.filter(casadoEmComunhaoUniversal).length;
  const faltaConjuge = universais === 1;
  const jaAdicionouConjuge = useRef(false);
  // o endereço do cônjuge acompanha o da primeira pessoa até alguém editar o endereço dele (aí cada um segue o seu)
  const conjugeAuto = useRef<{ onde: 'segundo' | number; acompanha: boolean } | null>(null);
  useEffect(() => {
    if (universais === 0) { jaAdicionouConjuge.current = false; conjugeAuto.current = null; return; }
    if (universais !== 1 || jaAdicionouConjuge.current) return;
    jaAdicionouConjuge.current = true;
    const de = pessoasDaParte.find(casadoEmComunhaoUniversal)!;
    const conjuge: DadosLocador = { ...LOCADOR_VAZIO, tipo: 'pessoa', estadoCivil: de.estadoCivil, regimeBens: de.regimeBens, cep: de.cep, logradouro: de.logradouro, numero: de.numero, complemento: de.complemento, bairro: de.bairro, cidade: de.cidade, uf: de.uf };
    conjugeAuto.current = { onde: maisDeUm === true ? outros.length : 'segundo', acompanha: de === principal };
    if (maisDeUm === true) setOutros(o => [...o, conjuge]);
    else { setSegundo(conjuge); setMaisDeUm(true); }
  }, [universais]); // eslint-disable-line react-hooks/exhaustive-deps
  const camposEndereco = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf'] as const;
  const aplicarEndereco = (x: DadosLocador): DadosLocador => (camposEndereco.every(c => x[c] === principal[c]) ? x : { ...x, ...Object.fromEntries(camposEndereco.map(c => [c, principal[c]])) });
  useEffect(() => {
    const a = conjugeAuto.current;
    if (!a || !a.acompanha) return;
    if (a.onde === 'segundo') setSegundo(aplicarEndereco);
    else setOutros(o => o.map((x, i) => (i === a.onde ? aplicarEndereco(x) : x)));
  }, [principal.cep, principal.logradouro, principal.numero, principal.complemento, principal.bairro, principal.cidade, principal.uf]); // eslint-disable-line react-hooks/exhaustive-deps
  /** Se a pessoa mexe no endereço do cônjuge, ele deixa de acompanhar o da primeira pessoa. */
  const mudouConjugeEm = (onde: 'segundo' | number, novo: DadosLocador) => {
    const a = conjugeAuto.current;
    if (a && a.onde === onde && a.acompanha && camposEndereco.some(c => novo[c] !== principal[c])) a.acompanha = false;
  };
  const qtdErros =
    (faltaConjuge ? 1 : 0) +
    Object.keys(validarParte(principal, papel)).length + qtdErrosConjuge(principal, exige) +
    (maisDeUm === true ? Object.keys(validarParte(segundo, papel)).length + qtdErrosConjuge(segundo, exige) + outros.reduce((n, d) => n + Object.keys(validarParte(d, papel)).length + qtdErrosConjuge(d, exige), 0) + (compartilhado === null ? 1 : 0) : 0);

  // "Adicionar outro" fica sempre à vista, sem limite de pessoas: o outro proprietário ou inquilino pode ser qualquer pessoa, não só o cônjuge
  const ultimoRef = useRef<HTMLDivElement>(null);
  const adicionarOutro = () => {
    if (maisDeUm === true) setOutros(o => [...o, LOCADOR_VAZIO]);
    else setMaisDeUm(true);
    setTimeout(() => {
      ultimoRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      focarSeTeclado(ultimoRef.current?.querySelector<HTMLElement>('input[type=radio]'));
    }, 80);
  };
  // tirar a segunda pessoa, sem ninguém depois dela, não apaga o que foi digitado: se a pessoa adicionar de novo, os dados voltam.
  // Com mais gente, quem vinha depois sobe uma posição.
  const removerSegundo = () => {
    conjugeAuto.current = null;
    if (outros.length > 0) { setSegundo(outros[0]); setOutros(outros.slice(1)); }
    else setMaisDeUm(false);
    setTimeout(() => irParaCampo(formRef.current, t.foco.mais), 80);
  };
  const removerOutro = (i: number) => { conjugeAuto.current = null; setOutros(o => o.filter((_, k) => k !== i)); setTimeout(() => irParaCampo(formRef.current, t.foco.mais), 80); };
  /** "Dados do 3º proprietário" e "Remover o 3º proprietário", a partir dos textos da segunda pessoa. */
  const tituloDe = (n: number) => t.tituloSegundo.replace('2º', `${n}º`);
  const removerDe = (n: number) => t.remover.replace('segundo', `${n}º`);

  const guardar = () => {
    if (!persistir) return;
    salvarRespostas(papel === 'locador' ? { locador: parte, usoAoPreencherLocador: uso } : { locatario: parte });
  };

  // guarda a cada mudança: voltar por outra página (ou pelo resumo) nunca perde o que já foi preenchido
  useEffect(guardar, [principal, segundo, outros, maisDeUm, compartilhado, uso]); // eslint-disable-line react-hooks/exhaustive-deps

  const seguir = () => {
    setTentou(true);
    if (qtdErros > 0) {
      setTentativa(n => n + 1);
      levarAoPrimeiroErro(formRef.current);
      return;
    }
    guardar();
    if (doResumo) { onVoltarAoResumo?.(); return; }
    onSeguinte?.(parte);
  };

  // volta para o prazo sem perder nada: guarda tudo, confere o que faltava e só então volta
  const voltarAoPrazo = () => {
    setTentou(true);
    if (qtdErros > 0) {
      setTentativa(n => n + 1);
      levarAoPrimeiroErro(formRef.current);
      return;
    }
    guardar();
    limparRetorno();
    onVoltarAoPrazo?.();
  };

  const resumo = construirResumo({
    atual: 'pessoas',
    uso,
    imovel: tipoImovel,
    locador: papel === 'locador' ? parte : (sessao.locador ?? outras?.locador),
    locatario: papel === 'locatario' ? parte : (sessao.locatario ?? outras?.locatario),
    administracao: (sessao.administracao ?? outras?.administracao) as Administracao | undefined,
    imobiliaria: sessao.imobiliaria ?? outras?.imobiliaria,
    usoAoPreencherLocador: sessao.usoAoPreencherLocador,
    contrato: sessao.contrato,
  });

  const irPara = (grupo: string, item?: string) => {
    if (paginaDoItem(item) === t.paginaId) { irParaCampo(formRef.current, item); return; }
    guardar();
    onIrParaSecao?.(grupo, item);
  };

  const erroRegra = tentou && maisDeUm === true && compartilhado === null;

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={0} pagina={{ atual: t.pagina, total: TOTAL_PAGINAS }} resumo={resumo} onSair={() => { guardar(); onSair?.(); }} onIrParaSecao={irPara}>
      <div className={styles.pagina} ref={formRef}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>{t.titulo}</h1>
          <p className={styles.lead}>{t.lead}</p>
        </header>

        <FormParte papel={papel} dados={principal} onChange={setPrincipal} tentou={tentou} foco={t.foco.um} exigeAnuencia={exige} progressivo semSalvar onImportarOutras={papel === 'locador' ? (d => { setSegundo(d[0]); setOutros(d.slice(1)); setMaisDeUm(true); }) : undefined} />

        {maisDeUm === true && (
          <div className={`${styles.segundoBloco} ${styles.aparece}`} ref={outros.length === 0 ? ultimoRef : undefined}>
            <div className={styles.segundoTopo}>
              <h2 className={styles.h2}>{t.tituloSegundo}</h2>
              <Button variant="ghost" size="sm" className={styles.botaoRemover} iconLeft={<X size={16} />} onClick={removerSegundo}>{t.remover}</Button>
            </div>
            <FormParte papel={papel} indice={2} dados={segundo} onChange={novo => { mudouConjugeEm('segundo', novo); setSegundo(novo); }} tentou={tentou} foco={t.foco.dois} exigeAnuencia={exige} arquivo={false} progressivo />
          </div>
        )}

        {maisDeUm === true && outros.map((d, i) => (
          <div key={i} className={`${styles.segundoBloco} ${styles.aparece}`} ref={i === outros.length - 1 ? ultimoRef : undefined}>
            <div className={styles.segundoTopo}>
              <h2 className={styles.h2}>{tituloDe(i + 3)}</h2>
              <Button variant="ghost" size="sm" className={styles.botaoRemover} iconLeft={<X size={16} />} onClick={() => removerOutro(i)}>{removerDe(i + 3)}</Button>
            </div>
            <FormParte papel={papel} indice={i + 3} dados={d} onChange={novo => { mudouConjugeEm(i, novo); setOutros(o => o.map((x, k) => (k === i ? novo : x))); }} tentou={tentou} foco={`${t.foco.um}${i + 3}`} exigeAnuencia={exige} arquivo={false} progressivo />
          </div>
        ))}

        {faltaConjuge && <Feedback type="warning" message={`Em comunhão universal de bens, o cônjuge também é ${papel === 'locatario' ? 'quem está alugando' : 'proprietário'}. Adicione os dados dele(a) como outra pessoa.`} />}

        <div className={`${styles.adicionar} ${styles.aparece}`} data-foco={t.foco.mais}>
          <p className={styles.adicionarAjuda}>{t.adicionarAjuda}</p>
          <div>
            <Button variant="outline" iconLeft={<Plus size={20} />} onClick={adicionarOutro}>{t.adicionar}</Button>
          </div>
        </div>

        {maisDeUm === true && (
          <div className={styles.pergunta} data-foco={t.foco.regra} data-invalido={erroRegra ? 'true' : undefined}>
            <GrupoOpcoes legenda={t.regraLegenda} colunas={2} erro={erroRegra ? 'Escolha uma opção para continuar.' : undefined}>
              <OpcaoCard name={`regra-${papel}`} value="sim" checked={compartilhado === true} onChange={() => setCompartilhado(true)} icone={<Users />} titulo={t.regraSim.titulo} descricao={t.regraSim.descricao} />
              <OpcaoCard name={`regra-${papel}`} value="nao" checked={compartilhado === false} onChange={() => setCompartilhado(false)} icone={<User />} titulo={t.regraNao.titulo} descricao={t.regraNao.descricao} />
            </GrupoOpcoes>
          </div>
        )}

        {/* "Vai alugar outros imóveis?" fica no fim, depois de adicionar outro proprietário: salva os dois (ou só um, à escolha) */}
        {papel === 'locador' && <SalvarDados papel={papel} dados={principal} demais={maisDeUm === true ? [segundo, ...outros] : []} />}

        <AvisoDeErros tentativa={tentativa} quantidade={qtdErros} />

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={() => { guardar(); onVoltar?.(); }}>Voltar</Button>
          {veioDoPrazo && onVoltarAoPrazo
            ? <Button iconRight={<ArrowRight size={20} />} onClick={() => voltarAoPrazo()}>Voltar ao prazo</Button>
            : <Button iconRight={doResumo ? undefined : <ArrowRight size={20} />} onClick={seguir}>{doResumo ? SALVAR_E_VOLTAR : 'Seguinte'}</Button>}
        </div>
      </div>
    </FluxoShell>
  );
}

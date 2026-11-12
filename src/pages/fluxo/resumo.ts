import { anuenciasPendentes, conjugesAnuentes } from './anuencia';
import type { ItemFalta, ResumoGrupo, ResumoItem } from './ResumoArvore';
import { validarParte } from '../PessoasEnvolvidas/FormParte';
import { efeitoDaResposta, erroDaPergunta, lacunasDaPagina, PAGINAS, paginaFluxoDoItem, perguntaVisivel, valorNoResumo, type GrupoResumoId, type PaginaFluxo } from './perguntas';
import { LOCADOR_VAZIO, parteTemDados, TITULO_IMOVEL, TITULO_USO, type Administracao, type Contrato, type DadosLocador, type Imovel, type ParteResp, type Uso } from './respostas';

/** Quantas páginas tem o preenchimento (indicador "Página N de N"). */
export const TOTAL_PAGINAS = 9;

export type SecaoId = 'pessoas' | GrupoResumoId;
/** Página do preenchimento onde cada item do resumo se edita. `imovel` é a página 5 (endereço); a página 1 é `tipo-locacao`. */
export type PaginaId = 'tipo-locacao' | 'dono' | 'inquilino' | 'administracao' | PaginaFluxo;

/** Em que página fica cada item do resumo (para o link levar direto ao campo). */
export function paginaDoItem(item?: string): PaginaId {
  if (!item) return 'tipo-locacao';
  const fluxo = paginaFluxoDoItem(item);
  if (fluxo) return fluxo;
  if (item.startsWith('dono')) return 'dono';
  if (item.startsWith('inq')) return 'inquilino';
  if (item.startsWith('adm') || item.startsWith('imobiliaria')) return 'administracao';
  return 'tipo-locacao';
}

export interface ContextoResumo {
  /** Seção (grupo do resumo) em que a pessoa está. */
  atual?: SecaoId;
  uso?: Uso | null;
  imovel?: Imovel | null;
  locador?: ParteResp;
  locatario?: ParteResp;
  administracao?: Administracao | null;
  imobiliaria?: DadosLocador;
  usoAoPreencherLocador?: Uso;
  /** Respostas das páginas 5 a 9. */
  contrato?: Contrato;
}

/**
 * O que cada resposta decide no contrato, em linguagem simples e sem o texto das cláusulas (que não deve aparecer na tela).
 * Os textos de efeito precisam ser validados com o cliente e o jurídico.
 */
const EFEITO_USO: Record<Uso, string> = {
  residencial: 'O contrato segue as regras de locação para moradia.',
  comercial: 'O contrato segue as regras de locação para negócio.',
};
const EFEITO_IMOVEL: Record<Imovel, string> = {
  'casa-condominio': 'Entram no contrato as regras e as taxas do condomínio.',
  'apartamento-condominio': 'Entram no contrato as regras e as taxas do condomínio.',
  'casa-fora': 'Não entram regras de condomínio.',
  condominio: 'Entram no contrato as regras e as taxas do condomínio.',
  'fora-condominio': 'Não entram regras de condomínio.',
};

interface Rotulos { um: string; dois: string; regra: string }

function itensDaParte(p: ParteResp | undefined, ids: Rotulos, nomes: Rotulos, regras: { sim: string; nao: string }): ResumoItem[] {
  const out: ResumoItem[] = [];
  if (!p) return out;
  if (p.principal.nome.trim()) out.push({ id: ids.um, rotulo: nomes.um, valor: p.principal.nome.trim() });
  if (p.maisDeUm === true) {
    out.push({ id: ids.dois, rotulo: nomes.dois, valor: p.segundo.nome.trim() || 'A preencher' });
    (p.outros ?? []).forEach((d, i) => out.push({ id: `${ids.um}${i + 3}`, rotulo: nomes.dois.replace(/^2º/, `${i + 3}º`), valor: d.nome.trim() || 'A preencher' }));
    if (p.compartilhado !== null) out.push({ id: ids.regra, rotulo: nomes.regra, valor: p.compartilhado ? regras.sim : regras.nao });
  }
  return out;
}

/** Itens do resumo das perguntas de uma página (5 a 9): só as que aparecem e já foram respondidas. */
function itensDaPagina(pagina: PaginaFluxo, c: Contrato, imovel?: Imovel | null): ResumoItem[] {
  const def = PAGINAS.find(p => p.id === pagina);
  if (!def) return [];
  return def.perguntas
    .filter(p => perguntaVisivel(p, c, { imovel: imovel ?? undefined }))
    .map(p => ({ id: p.id, rotulo: p.rotulo, valor: valorNoResumo(p, c), efeito: efeitoDaResposta(p, c) }))
    .filter(i => i.valor !== '');
}

/**
 * O que ainda falta responder nas páginas 5 a 9: só as perguntas obrigatórias que aparecem agora. Perguntas que dependem de
 * respostas ainda não dadas (por exemplo, as do condomínio) não dá para listar: `maisPerguntas` avisa que podem surgir outras.
 */
function faltamDaPagina(pagina: PaginaFluxo, c: Contrato, imovel?: Imovel | null): { faltam: ItemFalta[]; maisPerguntas: boolean } {
  const def = PAGINAS.find(p => p.id === pagina);
  if (!def) return { faltam: [], maisPerguntas: false };
  const ctx = { imovel: imovel ?? undefined };
  return {
    faltam: def.perguntas.filter(p => perguntaVisivel(p, c, ctx) && erroDaPergunta(p, c)).map(p => ({ id: p.id, rotulo: p.rotulo })),
    maisPerguntas: def.perguntas.some(p => !perguntaVisivel(p, c, ctx)),
  };
}

const GRUPOS_DO_FLUXO: Array<{ id: Exclude<GrupoResumoId, 'imovel'>; titulo: string; pagina: PaginaFluxo }> = [
  { id: 'valores', titulo: 'Valores e pagamento', pagina: 'valores' },
  { id: 'convivencia', titulo: 'Usar e conviver', pagina: 'convivencia' },
  { id: 'reparos', titulo: 'Mudanças e melhorias', pagina: 'reparos' },
  { id: 'saida', titulo: 'Saída e garantias', pagina: 'saida' },
];

/** Monta o índice do contrato (na ordem das páginas) a partir das respostas. Calculado a cada render: o que a pessoa muda aparece na hora. */
/** Nome do responsável pela intermediação (corretor ou imobiliária). */
export function nomeDaIntermediacao(d?: DadosLocador): string {
  return d?.nome.trim() || 'Imobiliária ou corretor';
}

export function construirResumo({ atual, uso, imovel, locador, locatario, administracao, imobiliaria, usoAoPreencherLocador, contrato = {} }: ContextoResumo): ResumoGrupo[] {
  const itensImovel: ResumoItem[] = [
    ...(uso ? [{ id: 'uso', rotulo: 'Uso do imóvel', valor: TITULO_USO[uso], efeito: EFEITO_USO[uso] }] : []),
    ...(imovel ? [{ id: 'tipo-imovel', rotulo: 'Como é o imóvel', valor: TITULO_IMOVEL[imovel], efeito: EFEITO_IMOVEL[imovel] }] : []),
    ...itensDaPagina('imovel', contrato, imovel),
  ];

  const itensLocador = itensDaParte(locador, { um: 'dono', dois: 'dono2', regra: 'dono-regra' }, { um: 'Proprietário', dois: '2º proprietário', regra: 'Cobrança entre proprietários' }, { sim: 'Qualquer um cobra o valor todo', nao: 'Cada um cobra a sua parte' });
  const itensLocatario = itensDaParte(locatario, { um: 'inq', dois: 'inq2', regra: 'inq-regra' }, { um: 'Quem vai alugar', dois: '2ª pessoa alugando', regra: 'Responsabilidade entre quem está alugando' }, { sim: 'Todos respondem pelo valor total', nao: 'Cada um responde pela sua parte' });
  // quem administra o aluguel vem logo depois do proprietário, na ordem das páginas
  const itensAdm: ResumoItem[] = administracao === 'imobiliaria'
    ? [{ id: 'adm', rotulo: 'Administra o aluguel', valor: nomeDaIntermediacao(imobiliaria), efeito: 'A taxa de administração fica por conta do proprietário, não de quem está alugando.' }]
    : administracao === 'proprio' ? [{ id: 'adm', rotulo: 'Administra o aluguel', valor: 'O próprio proprietário' }] : [];
  const itensPessoas: ResumoItem[] = [...itensLocador, ...itensAdm, ...itensLocatario];
  // cada cônjuge anuente entra logo abaixo da pessoa a que está ligado
  for (const a of conjugesAnuentes(contrato, locador, locatario)) {
    const posicao = itensPessoas.findIndex(i => i.id === a.id);
    const item = { id: `${a.id}-conjuge`, rotulo: `Cônjuge anuente de ${a.nome.split(/\s+/)[0]}`, valor: a.conjuge.nome.trim() };
    if (posicao >= 0) itensPessoas.splice(posicao + 1, 0, item);
    else itensPessoas.push(item);
  }

  const mudouUso = !!uso && !!usoAoPreencherLocador && uso !== usoAoPreencherLocador;

  // o que falta no grupo Imóvel: a primeira página (uso e tipo) e a de endereço
  const doEndereco = faltamDaPagina('imovel', contrato, imovel);
  const faltamImovel: ItemFalta[] = [
    ...(uso ? [] : [{ id: 'uso', rotulo: 'Uso do imóvel' }]),
    ...(imovel ? [] : [{ id: 'tipo-imovel', rotulo: 'Como é o imóvel' }]),
    ...doEndereco.faltam,
  ];

  // o que falta no grupo Pessoas: cada parte, e quem administra o aluguel
  const faltamPessoas: ItemFalta[] = [];
  const parteFalta = (id: string, p: ParteResp | undefined, papel: 'locador' | 'locatario', quem: string, vazio: string) => {
    const n = lacunasDaParte(p, papel);
    if (n > 0) faltamPessoas.push({ id, rotulo: parteTemDados(p) ? `${quem}: ${n === 1 ? 'falta 1 informação' : `faltam ${n} informações`}` : vazio });
  };
  parteFalta('dono', locador, 'locador', 'Proprietário', 'Dados do proprietário');
  if (!administracao) faltamPessoas.push({ id: 'adm', rotulo: 'Quem administra o aluguel' });
  else if (administracao === 'imobiliaria') {
    const n = Object.keys(validarParte(imobiliaria ?? LOCADOR_VAZIO, 'imobiliaria')).length;
    if (n > 0) faltamPessoas.push({ id: 'adm', rotulo: `Imobiliária ou corretor: ${n === 1 ? 'falta 1 informação' : `faltam ${n} informações`}` });
  }
  parteFalta('inq', locatario, 'locatario', 'Quem vai alugar', 'Dados de quem vai alugar');

  return [
    { id: 'imovel', titulo: 'Imóvel', itens: itensImovel, faltam: faltamImovel, maisPerguntas: doEndereco.maisPerguntas, estado: atual === 'imovel' ? 'atual' : itensImovel.length ? 'preenchida' : 'pendente' },
    {
      id: 'pessoas',
      titulo: 'Pessoas envolvidas',
      itens: itensPessoas,
      faltam: faltamPessoas,
      maisPerguntas: faltamPessoas.length > 0,
      estado: atual === 'pessoas' ? 'atual' : !parteTemDados(locador) ? 'pendente' : mudouUso ? 'atencao' : 'preenchida',
      aviso: 'O uso do imóvel mudou. Confira se os dados ainda servem.',
    },
    ...GRUPOS_DO_FLUXO.map(g => {
      const itens = itensDaPagina(g.pagina, contrato, imovel);
      const { faltam, maisPerguntas } = faltamDaPagina(g.pagina, contrato, imovel);
      return { id: g.id, titulo: g.titulo, itens, faltam, maisPerguntas, estado: atual === g.id ? ('atual' as const) : itens.length ? ('preenchida' as const) : ('pendente' as const) };
    }),
  ];
}

// ───────── o que falta preencher (para a tela de revisão) ─────────

export interface Pendencia {
  pagina: PaginaId;
  /** Nome da página, como aparece na tela. */
  titulo: string;
  /** Quantas perguntas faltam. */
  faltam: number;
  /** A página ainda não foi aberta (nada preenchido). */
  vazia: boolean;
  /** Item para onde o link leva (o primeiro que falta, quando se sabe). */
  item?: string;
}

function lacunasDaParte(p: ParteResp | undefined, papel: 'locador' | 'locatario'): number {
  const parte = p ?? { principal: LOCADOR_VAZIO, segundo: LOCADOR_VAZIO, maisDeUm: null, compartilhado: null };
  return (
    Object.keys(validarParte(parte.principal, papel)).length +
    (parte.maisDeUm === true ? Object.keys(validarParte(parte.segundo, papel)).length + (parte.outros ?? []).reduce((n, d) => n + Object.keys(validarParte(d, papel)).length, 0) + (parte.compartilhado === null ? 1 : 0) : 0)
  );
}

/** Páginas com perguntas ainda sem resposta, na ordem do preenchimento. Vazio = tudo preenchido. */
export function pendenciasDoContrato(ctx: ContextoResumo): Pendencia[] {
  const c = ctx.contrato ?? {};
  const out: Pendencia[] = [];
  const add = (pagina: PaginaId, titulo: string, faltam: number, vazia: boolean, item?: string) => { if (faltam > 0) out.push({ pagina, titulo, faltam, vazia, item }); };

  add('tipo-locacao', 'Tipo de locação e de imóvel', (ctx.uso ? 0 : 1) + (ctx.imovel ? 0 : 1), !ctx.uso && !ctx.imovel, ctx.uso ? 'tipo-imovel' : 'uso');
  add('dono', 'Quem oferece o imóvel', lacunasDaParte(ctx.locador, 'locador'), !parteTemDados(ctx.locador), 'dono');
  // prazo de 10 anos ou mais: falta o cônjuge de quem é casado(a)
  for (const p of anuenciasPendentes(c, ctx.locador, ctx.locatario)) add(p.papel === 'locador' ? 'dono' : 'inquilino', `Cônjuge anuente de ${p.nome.split(/\s+/)[0]}`, 1, false, `${p.id}-conjuge`);
  const admFalta = ctx.administracao ? (ctx.administracao === 'imobiliaria' ? Object.keys(validarParte(ctx.imobiliaria ?? LOCADOR_VAZIO, 'imobiliaria')).length : 0) : 1;
  add('administracao', 'Quem administra o aluguel', admFalta, !ctx.administracao, 'adm');
  add('inquilino', 'Quem vai alugar', lacunasDaParte(ctx.locatario, 'locatario'), !parteTemDados(ctx.locatario), 'inq');
  for (const def of PAGINAS) {
    const faltam = lacunasDaPagina(def, c, { imovel: ctx.imovel ?? undefined });
    const primeira = def.perguntas.find(p => perguntaVisivel(p, c, { imovel: ctx.imovel ?? undefined }) && !itensDaPagina(def.id, c, ctx.imovel).some(i => i.id === p.id) && (p.tipo !== 'texto' || !p.opcional));
    add(def.id, TITULO_DA_PAGINA[def.id], faltam, !def.perguntas.some(p => (c[p.id] ?? '') !== '' || (p.tipo === 'endereco' && !!c['im-cep'])), primeira?.id);
  }
  return out;
}

export const TITULO_DA_PAGINA: Record<PaginaFluxo, string> = {
  imovel: 'Dados do imóvel',
  valores: 'Valores e pagamento',
  convivencia: 'Usar e conviver',
  reparos: 'Mudanças e melhorias',
  saida: 'Saída, garantias e penalidades',
};

// ───────── frases da revisão ─────────

/**
 * A resposta como uma frase, do jeito que o assunto aparece no contrato, mas sem o texto da cláusula. Quando a resposta
 * já tem um "efeito" (o que ela decide), esse texto é a frase; os dados digitados viram frases curtas.
 * As frases precisam ser conferidas com o cliente e o jurídico.
 */
export function fraseDoItem(item: ResumoItem): string {
  const { id = '', rotulo, valor, efeito } = item;
  const fim = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);
  if (id.endsWith('-conjuge')) return `${rotulo}: ${valor}.`;
  const frases: Record<string, string> = {
    dono: `Proprietário (locador): ${valor}.`,
    dono2: `Segundo proprietário (locador): ${valor}.`,
    adm: `${valor} administra o aluguel.`,
    inq: `Quem está alugando: ${valor}.`,
    inq2: `Segunda pessoa alugando: ${valor}.`,
    'im-endereco': `O imóvel fica em ${valor}.`,
    'im-matricula': `Matrícula do imóvel: ${valor}.`,
    'im-inventario': `Inventário do imóvel com ${valor}.`,
    'va-aluguel': `Aluguel mensal de ${valor}.`,
    'va-inicio': `O aluguel começa em ${valor}.`,
    'va-prazo': `O contrato dura ${mesesComAnos(valor)}.`,
    'va-vencimento': `Vencimento ${valor.charAt(0).toLowerCase()}${valor.slice(1)} de cada mês.`,
    'va-forma': `O aluguel é pago por ${valor}.`,
    'va-juros-valor': `Juros de ${valor} ao mês no atraso do aluguel.`,
    'va-multa-valor': `Multa de ${valor} no atraso do aluguel.`,
    'va-cond-valor': `Taxa do condomínio de cerca de ${valor}.`,
    'va-cond-juros-valor': `Juros de ${valor} ao mês no atraso do condomínio.`,
    'va-cond-multa-valor': `Multa de ${valor} no atraso do condomínio.`,
    'sa-multa-valor': `O valor da multa por sair antes do prazo é de ${valor}.`,
    'sa-desoneracao-mes': `A multa deixa de valer a partir do ${valor}.`,
    'sa-desoneracao-aviso': `Para ter a isenção, quem está alugando avisa com ${valor} de antecedência.`,
    'co-vistoria-prazo': `Quem está alugando tem ${valor} para questionar a vistoria de entrada.`,
    'co-util-locatario': `Contas pagas direto por quem está alugando: ${valor}.`,
    'co-util-restituir': `Contas que o proprietário paga e quem está alugando devolve: ${valor}.`,
    'sa-caucao': `Depósito de garantia de ${valor}.`,
    'sa-fiador': `Fiador: ${valor}.`,
    'sa-aviso': `Aviso de ${valor} para sair do imóvel.`,
  };
  return frases[id] ?? (efeito ? fim(efeito) : fim(`${rotulo}: ${valor}`));
}

// ───────── frases agrupadas na revisão ─────────

/** "30 meses" → "30 meses (2 anos e 6 meses)". Com menos de 12 meses, fica como está. */
export function mesesComAnos(valor: string): string {
  const n = Number(/^(\d+)\s*mes/.exec(valor.trim())?.[1]);
  if (!Number.isInteger(n) || n < 12) return valor;
  const anos = Math.floor(n / 12);
  const meses = n % 12;
  const a = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  return `${valor} (${meses ? `${a} e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : a})`;
}

export interface FraseDoGrupo {
  /** Item a que a frase leva ao editar: o primeiro do grupo. */
  id?: string;
  /** Todos os itens que a frase cobre (para achar a linha de um item que foi editado). */
  ids: string[];
  frase: string;
}

/** Primeira letra minúscula, menos em siglas (como "TV"). */
const baixa = (t: string): string => (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2}/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
const ponto = (t: string): string => (/[.!?]$/.test(t) ? t : `${t}.`);
/** "a, b e c"; um "sem …" no fim entra depois de vírgula ("juros de 1% ao mês, sem multa"). */
function unir(partes: string[]): string {
  if (partes.length <= 1) return partes.join('');
  const ultima = partes[partes.length - 1];
  return `${partes.slice(0, -1).join(', ')}${ultima.startsWith('sem ') ? ', ' : ' e '}${ultima}`;
}

/**
 * As frases de um assunto na revisão. Respostas que se leem melhor juntas e se editam na mesma página viram uma frase só
 * (por exemplo, "Aluguel mensal de R$ 2.500,00, com vencimento todo dia 5, pago por Pix."); a seta de editar leva ao primeiro
 * campo do grupo. Só agrupa quando as respostas do grupo existem; senão, cada uma continua com a sua frase. As cláusulas
 * padrão ficam fora: cada ponto tem a sua. As frases precisam ser conferidas com o cliente e o jurídico.
 */
export function frasesDoGrupo(itens: ResumoItem[]): FraseDoGrupo[] {
  // "cobra juros: sim" e "juros de 1%" dizem a mesma coisa: fica só a frase com o valor
  const visiveis = itens.filter(i => !itens.some(x => x.id === `${i.id}-valor`));
  const por = (id: string) => visiveis.find(i => i.id === id);
  const v = (id: string) => por(id)?.valor ?? '';
  const regras: Array<{ ids: string[]; frase: string }> = [];
  const regra = (ids: string[], frase: string) => regras.push({ ids, frase });

  // imóvel
  if (por('im-endereco') && por('im-matricula')) regra(['im-endereco', 'im-matricula'], `O imóvel fica em ${v('im-endereco').replace(/\.$/, '')} (matrícula ${v('im-matricula')}).`);

  // valores e pagamento
  if (por('va-inicio') && por('va-prazo')) regra(['va-inicio', 'va-prazo'], `O contrato começa em ${v('va-inicio')} e dura ${mesesComAnos(v('va-prazo'))}.`);
  if (por('va-aluguel') && (por('va-vencimento') || por('va-forma'))) {
    regra(['va-aluguel', 'va-vencimento', 'va-forma'], ponto(`Aluguel mensal de ${v('va-aluguel')}${por('va-vencimento') ? `, com vencimento ${baixa(v('va-vencimento'))}` : ''}${por('va-forma') ? `, pago por ${v('va-forma')}` : ''}`));
  }
  const atrasoPartes = (p: string): string[] => [
    por(`${p}-juros-valor`) ? `juros de ${v(`${p}-juros-valor`)} ao mês` : v(`${p}-juros`).toLowerCase() === 'não' ? 'sem juros' : '',
    por(`${p}-multa-valor`) ? `multa de ${v(`${p}-multa-valor`)}` : v(`${p}-multa`).toLowerCase() === 'não' ? 'sem multa' : '',
  ].filter(Boolean);
  const atrasoAluguel = [...atrasoPartes('va'), ...(por('va-correcao') ? [`correção pelo ${v('va-correcao')}`] : [])];
  if (atrasoAluguel.length >= 2) regra(['va-juros-valor', 'va-juros', 'va-multa-valor', 'va-multa', 'va-correcao'], `Se o aluguel atrasar: ${unir(atrasoAluguel)}.`);
  const atrasoCond = atrasoPartes('va-cond');
  if (por('va-cond-valor') && atrasoCond.length >= 1) regra(['va-cond-valor', 'va-cond-juros-valor', 'va-cond-juros', 'va-cond-multa-valor', 'va-cond-multa'], `Condomínio de cerca de ${v('va-cond-valor')}. Se atrasar: ${unir(atrasoCond)}.`);

  // usar e conviver
  if (por('co-vistoria') && por('co-vistoria-prazo') && v('co-vistoria').toLowerCase() === 'sim') regra(['co-vistoria', 'co-vistoria-prazo'], `Há vistoria de entrada, e quem está alugando tem ${v('co-vistoria-prazo')} para questionar.`);
  if (por('co-util-locatario') && por('co-util-restituir')) {
    const lista = (t: string) => (t === 'Nenhum' ? 'nenhuma' : t.split(', ').map(baixa).join(', '));
    regra(['co-util-locatario', 'co-util-restituir'], `Contas pagas direto por quem está alugando: ${lista(v('co-util-locatario'))}. Reembolsadas ao proprietário: ${lista(v('co-util-restituir'))}.`);
  }

  // mudanças e melhorias
  if (por('re-obras') && por('re-saida')) regra(['re-obras', 're-saida'], `Obras: ${baixa(v('re-obras'))}. Ao sair: ${baixa(v('re-saida'))}.`);
  const benf = [
    { id: 're-benf-necessarias', nome: 'que evitam estragos' },
    { id: 're-benf-uteis', nome: 'que facilitam o uso' },
    { id: 're-benf-voluptuarias', nome: 'de capricho ou conforto' },
  ];
  if (benf.every(b => por(b.id))) {
    const sim = benf.filter(b => v(b.id).toLowerCase() === 'sim').map(b => b.nome);
    const nao = benf.filter(b => v(b.id).toLowerCase() !== 'sim').map(b => b.nome);
    regra(benf.map(b => b.id),
      nao.length === 0 ? 'No fim da locação, o proprietário devolve o valor de todas as melhorias.'
        : sim.length === 0 ? 'No fim da locação, o proprietário não devolve o valor de nenhuma melhoria.'
          : `No fim da locação, o proprietário devolve o valor das melhorias ${unir(sim)}, mas não das ${unir(nao)}.`);
  }

  // saída e garantias
  const garantia = por('sa-garantia');
  if (garantia?.efeito?.startsWith('Um depósito fica') && por('sa-caucao')) regra(['sa-garantia', 'sa-caucao'], ponto(garantia.efeito.replace('Um depósito fica', `Um depósito de ${v('sa-caucao')} fica`)));
  if (por('sa-multa-valor') && por('sa-aviso')) {
    const isencao = por('sa-desoneracao-mes')
      ? ` A multa deixa de valer a partir do ${v('sa-desoneracao-mes')}${por('sa-desoneracao-aviso') ? `, avisando com ${v('sa-desoneracao-aviso')}` : ''}.`
      : por('sa-desoneracao')?.efeito ? ` ${ponto(por('sa-desoneracao')?.efeito ?? '')}` : '';
    regra(['sa-multa-valor', 'sa-aviso', 'sa-desoneracao', 'sa-desoneracao-mes', 'sa-desoneracao-aviso'], `Quem sair antes do prazo paga multa proporcional de ${v('sa-multa-valor')}, com aviso de ${v('sa-aviso')}.${isencao}`);
  }

  const saida: FraseDoGrupo[] = [];
  const jaFoi = new Set<number>();
  for (const i of visiveis) {
    const k = regras.findIndex(r => !!i.id && r.ids.includes(i.id));
    if (k < 0) { saida.push({ id: i.id, ids: i.id ? [i.id] : [], frase: fraseDoItem(i) }); continue; }
    if (jaFoi.has(k)) continue;
    jaFoi.add(k);
    saida.push({ id: i.id, ids: regras[k].ids, frase: regras[k].frase });
  }
  return saida;
}

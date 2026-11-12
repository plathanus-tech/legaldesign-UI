import type { ReactNode } from 'react';
import { ListChecks,
  Ban, Banknote, Car, ClipboardCheck, DoorOpen, FileSignature, Hammer, Handshake, House, Landmark,
  Lock, Percent, QrCode, Receipt, Scale, ShieldCheck, Sofa, Trash2, Users, Wrench,
} from 'lucide-react';
import { validarParte } from '../PessoasEnvolvidas/FormParte';
import { LOCADOR_VAZIO, type Contrato, type DadosLocador, type Imovel } from './respostas';

/**
 * Perguntas das páginas 5 a 9 do preenchimento (imóvel, valores, convivência, obras, saída).
 * Cada pergunta é uma escolha em cards ou um campo. O que a pessoa responde vira um item do resumo, com o que essa
 * resposta decide no contrato em linguagem simples (`efeito`), nunca o texto da cláusula.
 *
 * Atenção: as perguntas e as opções abaixo são uma proposta de estrutura. O cliente ainda não passou a lista final de
 * campos dessas páginas, então cada pergunta, opção e texto de efeito precisa ser validado com o cliente e o jurídico.
 */
export type PaginaFluxo = 'imovel' | 'valores' | 'convivencia' | 'reparos' | 'saida';
export type GrupoResumoId = 'imovel' | 'valores' | 'convivencia' | 'reparos' | 'saida';

export interface OpcaoDef {
  valor: string; titulo: string; descricao?: string; efeito?: string; icone: ReactNode;
  /** A opção só é oferecida quando devolve verdadeiro (depende de outras respostas). */
  quando?: (c: Contrato) => boolean;
}

/** As opções de uma pergunta de escolher uma que podem ser oferecidas com as respostas de agora. */
export const opcoesVisiveis = (opcoes: OpcaoDef[], c: Contrato) => opcoes.filter(o => !o.quando || o.quando(c));

/** O mês do contrato (como "12º mês") ainda cabe na duração do contrato? Sem duração informada, cabe. */
const mesCabeNoContrato = (mes: number) => (c: Contrato) => {
  const prazo = Number(c['va-prazo']);
  return !(Number.isInteger(prazo) && prazo > 0) || mes <= prazo;
};

interface Base {
  /** Também é o id do item no resumo e o `data-foco` do campo. Sempre começa com o prefixo da página (ex.: `va-`). */
  id: string;
  /** Nome do item no resumo. */
  rotulo: string;
  /** Só aparece quando devolve verdadeiro (depende de outras respostas). */
  quando?: (c: Contrato, ctx: { imovel?: Imovel }) => boolean;
  /** Título de um bloco de perguntas. Aparece acima desta pergunta (e vale até a próxima que tiver um). */
  secao?: string;
  /** Texto de apoio logo abaixo do título da seção (`secao`). */
  secaoAjuda?: string;
  /** Subtítulo dentro de uma seção (nível abaixo de `secao`). Aparece acima desta pergunta. */
  subsecao?: string;
}

export interface PerguntaOpcoes extends Base { tipo: 'opcoes'; legenda: string; ajuda?: string; colunas?: 2 | 3; curtas?: boolean; opcoes: OpcaoDef[] }
/** Marcar várias opções (zero ou mais). O valor guardado é a lista dos `valor` separados por vírgula. */
export interface PerguntaMulti extends Base {
  tipo: 'multi';
  legenda: string;
  ajuda?: string;
  opcoes: Array<{ valor: string; titulo: string }>;
  /** Não oferece o que já foi marcado nesta outra pergunta (id). */
  excluirDe?: string;
}
export interface PerguntaCampo extends Base {
  tipo: 'texto' | 'moeda' | 'numero' | 'data' | 'percentual';
  label: string;
  ajuda?: string;
  placeholder?: string;
  /** Texto que acompanha o valor no resumo (ex.: "meses"). */
  unidade?: string;
  opcional?: boolean;
  /** Campo que depende da pergunta de cima: fica a 16px dela em vez do espaço normal entre perguntas (32px). */
  colado?: boolean;
  /** Ícone de ajuda ao lado do rótulo, com uma dica em painel flutuante (título e parágrafos). */
  dica?: { titulo: string; texto: string[] };
  /** Só para números: menor e maior valor aceitos. */
  min?: number;
  max?: number;
}
export interface PerguntaEndereco extends Base { tipo: 'endereco'; titulo: string }
/** Dados completos de uma pessoa (ex.: o fiador), pedidos na hora. Guardados como um texto JSON dos `DadosLocador`. */
export interface PerguntaParte extends Base { tipo: 'parte'; papel: 'fiador' }

/** Lista de itens (inventário de móveis e utensílios). Guardada como um texto JSON de `ItemInventario[]`. */
export interface PerguntaInventario extends Base { tipo: 'inventario'; titulo: string; ajuda?: string }

export type Pergunta = PerguntaOpcoes | PerguntaMulti | PerguntaCampo | PerguntaEndereco | PerguntaParte | PerguntaInventario;

/** Um item do inventário. A quantidade é guardada como texto (só números). */
export interface ItemInventario { item: string; qtd: string; estado: string }
/** Estados possíveis de um item. Os nomes são uma proposta: precisam ser validados com o cliente e o jurídico. */
export const ESTADOS_DO_ITEM = [
  { value: 'novo', label: 'Novo' },
  { value: 'bom', label: 'Bom' },
  { value: 'usado', label: 'Com marcas de uso' },
  { value: 'defeito', label: 'Com defeito' },
];
export const ITEM_VAZIO: ItemInventario = { item: '', qtd: '1', estado: '' };

/** Lê o inventário guardado numa resposta. Sem nada, devolve uma linha em branco para a pessoa começar. */
export function lerInventario(c: Contrato, id: string): ItemInventario[] {
  try {
    const lista = JSON.parse(c[id] ?? '[]') as Partial<ItemInventario>[];
    const itens = lista.map(x => ({ ...ITEM_VAZIO, ...x }));
    return itens.length ? itens : [{ ...ITEM_VAZIO }];
  } catch { return [{ ...ITEM_VAZIO }]; }
}
const linhaVazia = (x: ItemInventario) => x.item.trim() === '' && x.estado === '' && (x.qtd === '' || x.qtd === '1');
/** Itens que valem (com nome). Linhas em branco não contam. */
export const itensDoInventario = (c: Contrato, id: string): ItemInventario[] => lerInventario(c, id).filter(x => x.item.trim() !== '');
/** Erros por linha e o erro geral (nenhum item). */
export function errosDoInventario(itens: ItemInventario[]): { linhas: Array<{ item?: string; qtd?: string }>; geral?: string } {
  const linhas = itens.map(x => {
    if (linhaVazia(x)) return {};
    if (!x.item.trim()) return { item: 'Informe o item.' };
    if (!/^\d+$/.test(x.qtd) || Number(x.qtd) < 1) return { qtd: 'Informe a quantidade.' };
    return {};
  });
  const temItem = itens.some(x => x.item.trim() !== '');
  return { linhas, geral: temItem ? undefined : 'Adicione pelo menos um item ao inventário.' };
}

/** Lê os dados de uma pessoa guardados numa resposta (vazio se ainda não digitou nada). */
export function lerParteDaResposta(c: Contrato, id: string): DadosLocador {
  try { return { ...LOCADOR_VAZIO, tipo: 'pessoa', ...(JSON.parse(c[id] ?? '{}') as Partial<DadosLocador>) }; } catch { return { ...LOCADOR_VAZIO, tipo: 'pessoa' }; }
}

export interface PaginaDef {
  id: PaginaFluxo;
  /** Número da página no indicador "Página N de 9". */
  numero: 5 | 6 | 7 | 8 | 9;
  grupo: GrupoResumoId;
  titulo: string;
  lead: string;
  /** Aviso de explicação (legal design) mostrado no topo da página. */
  explicacao?: { titulo: string; texto: string };
  /** Aviso mostrado depois das perguntas, antes dos botões. */
  rodape?: { titulo?: string; texto: string; /** Nota simples no fim da página, sem caixa, ícone nem título (para o que é só complementar). */ discreto?: boolean };
  /** Agrupa as perguntas em seções de verdade: cada `secao` abre um bloco com o título e as perguntas seguintes ficam dentro dele, sem linhas entre elas. */
  agruparSecoes?: boolean;
  perguntas: Pergunta[];
}

/** Imóvel em condomínio (escolhido na página 1): libera as perguntas do condomínio. */
const EM_CONDOMINIO = (_c: Contrato, ctx: { imovel?: Imovel }): boolean => ctx.imovel === 'casa-condominio' || ctx.imovel === 'apartamento-condominio' || ctx.imovel === 'condominio';

const UTILIDADES = [
  { valor: 'agua', titulo: 'Água' },
  { valor: 'gas', titulo: 'Gás' },
  { valor: 'luz', titulo: 'Luz' },
  { valor: 'internet', titulo: 'Internet e telefone' },
  { valor: 'tv', titulo: 'TV a cabo e streaming' },
];

/**
 * Perguntas de atraso: cobrar juros? (quanto) e cobrar multa? (quanto). O valor é digitado pela pessoa: nenhum valor
 * vem sugerido. `p` é o prefixo dos ids (ex.: `va` → `va-juros`).
 */
function atraso(p: string, de: string, secao: string, comCorrecao: boolean, quando?: Pergunta['quando'], comoSubsecao = false): Pergunta[] {
  const sn = (nome: string, rotulo: string, pergunta: string, efeitoSim: string, secaoDaPergunta?: string, ajuda?: string): PerguntaOpcoes => ({
    id: `${p}-${nome}`, rotulo, quando, secao: comoSubsecao ? undefined : secaoDaPergunta, subsecao: comoSubsecao ? secaoDaPergunta : undefined, tipo: 'opcoes', curtas: true, legenda: pergunta, ajuda,
    opcoes: [
      { valor: 'sim', titulo: 'Sim', descricao: 'Será cobrado.', efeito: efeitoSim, icone: <Scale /> },
      { valor: 'nao', titulo: 'Não', descricao: 'Não será cobrado.', efeito: `Não há ${nome === 'juros' ? 'juros' : 'multa'} no atraso do ${de}.`, icone: <Handshake /> },
    ],
  });
  const valor = (nome: 'juros' | 'multa', label: string): PerguntaCampo => ({
    id: `${p}-${nome}-valor`, rotulo: `Valor ${nome === 'juros' ? 'dos juros' : 'da multa'} (${de})`, tipo: 'percentual', label, ajuda: nome === 'juros' ? 'Informe em porcentagem (%) ao mês' : 'Informe em porcentagem (%). A multa é cobrada uma vez só', placeholder: 'Ex.: 2',
    quando: (c, ctx) => c[`${p}-${nome}`] === 'sim' && (!quando || quando(c, ctx)),
  });
  return [
    sn('juros', `Juros no atraso do ${de}`, 'Serão cobrados juros?', `Atraso no pagamento do ${de} gera juros.`, secao, 'Multa é um valor cobrado uma vez pelo atraso. Juros aumentam a cada mês de atraso.'),
    valor('juros', 'Qual o valor dos juros por mês?'),
    sn('multa', `Multa no atraso do ${de}`, 'Será cobrada multa?', `Atraso no pagamento do ${de} gera multa.`),
    valor('multa', 'Qual o valor da multa?'),
    ...(comCorrecao ? [{
      id: `${p}-correcao`, rotulo: `Correção do valor em atraso (${de})`, tipo: 'opcoes' as const, curtas: true, quando,
      legenda: 'Qual índice corrige o valor em atraso?', ajuda: 'Correção monetária é a atualização do valor de uma dívida para acompanhar a inflação',
      opcoes: [
        { valor: 'igpm', titulo: 'IGP-M', descricao: 'Índice muito usado em aluguéis.', efeito: `O valor em atraso do ${de} é corrigido pelo IGP-M.`, icone: <Percent /> },
        { valor: 'ipca', titulo: 'IPCA', descricao: 'Índice oficial da inflação.', efeito: `O valor em atraso do ${de} é corrigido pelo IPCA.`, icone: <Percent /> },
      ],
    } satisfies PerguntaOpcoes] : []),
  ];
}

/** Campos do endereço do imóvel, na ordem. */
export const CAMPOS_ENDERECO = ['im-cep', 'im-logradouro', 'im-numero', 'im-complemento', 'im-bairro', 'im-cidade', 'im-uf'] as const;

const sim = (titulo: string, descricao?: string, efeito?: string, icone: ReactNode = <ClipboardCheck />): OpcaoDef => ({ valor: 'sim', titulo, descricao, efeito, icone });
const nao = (titulo: string, descricao?: string, efeito?: string, icone: ReactNode = <Ban />): OpcaoDef => ({ valor: 'nao', titulo, descricao, efeito, icone });

export const PAGINAS: PaginaDef[] = [
  {
    id: 'imovel',
    numero: 5,
    grupo: 'imovel',
    titulo: 'Onde fica o imóvel?',
    lead: 'Informe o endereço e o que o imóvel tem. Isso identifica o imóvel no contrato.',
    perguntas: [
      { id: 'im-endereco', rotulo: 'Endereço do imóvel', tipo: 'endereco', titulo: 'Endereço do imóvel' },
      { id: 'im-matricula', rotulo: 'Matrícula', tipo: 'texto', label: 'Número da matrícula', ajuda: 'Número que aparece no registro do imóvel (escritura ou certidão)', opcional: true },
      {
        id: 'im-mobiliado', rotulo: 'Móveis e utensílios', tipo: 'opcoes', curtas: true,
        legenda: 'O imóvel será alugado com móveis ou utensílios?', colunas: 3,
        opcoes: [
          { ...sim('Sim', 'Móveis, eletrodomésticos ou outros itens.', 'O contrato inclui os itens deixados no imóvel e o cuidado com eles.', <Sofa />) },
          { valor: 'inventario', titulo: 'Sim, com inventário', descricao: 'Uma lista dos itens e do estado de cada um.', efeito: 'O contrato inclui os itens deixados no imóvel, com um inventário que lista cada item e o seu estado.', icone: <ListChecks /> },
          { ...nao('Não', 'O imóvel será entregue vazio.', 'O contrato não trata de móveis ou utensílios.', <DoorOpen />) },
        ],
      },
      {
        id: 'im-inventario', secao: 'Inventário do imóvel', rotulo: 'Inventário', tipo: 'inventario', titulo: 'Inventário do imóvel',
        ajuda: 'Liste o que fica no imóvel e como está cada item. Você pode adicionar quantos itens precisar',
        quando: c => c['im-mobiliado'] === 'inventario',
      },
      {
        id: 'im-garagem', rotulo: 'Vaga de garagem', tipo: 'opcoes', curtas: true,
        legenda: 'O imóvel tem vaga de garagem?',
        opcoes: [
          { ...sim('Sim', 'A vaga faz parte do aluguel.', 'A vaga entra no contrato junto com o imóvel.', <Car />) },
          { ...nao('Não', 'O imóvel não tem vaga.', undefined, <Ban />) },
        ],
      },
    ],
  },
  {
    id: 'valores',
    numero: 6,
    grupo: 'valores',
    agruparSecoes: true,
    titulo: 'Quanto custa e como será pago?',
    lead: 'Informe o valor do aluguel, por quanto tempo e como o pagamento será feito.',
    perguntas: [
      { id: 'va-aluguel', secao: 'Aluguel', rotulo: 'Aluguel por mês', tipo: 'moeda', label: 'Valor do aluguel por mês', placeholder: 'R$ 0,00' },
      { id: 'va-inicio', rotulo: 'Início do aluguel', tipo: 'data', label: 'Data de início do contrato' },
      { id: 'va-prazo', rotulo: 'Duração', tipo: 'numero', label: 'Por quantos meses?', ajuda: 'O tempo que o contrato vai durar', unidade: 'meses', min: 1, max: 360 },
      { id: 'va-vencimento', rotulo: 'Vencimento', tipo: 'numero', label: 'Dia do mês para pagar', ajuda: 'Um dia de 1 a 31', unidade: 'dia do mês', min: 1, max: 31 },
      {
        id: 'va-forma', rotulo: 'Forma de pagamento', tipo: 'opcoes', colunas: 3,
        legenda: 'Como o aluguel será pago?',
        opcoes: [
          { valor: 'pix', titulo: 'Pix', descricao: 'Pagamento na hora, para uma chave Pix.', icone: <QrCode /> },
          { valor: 'boleto', titulo: 'Boleto', descricao: 'Boleto enviado para quem está alugando.', icone: <Receipt /> },
          { valor: 'transferencia', titulo: 'Transferência', descricao: 'Para uma conta bancária.', icone: <Landmark /> },
        ],
      },
      {
        id: 'va-reajuste', rotulo: 'Reajuste do aluguel', tipo: 'opcoes', colunas: 3,
        legenda: 'Como o aluguel será reajustado?',
        ajuda: 'O reajuste atualiza o valor do aluguel conforme o índice definido no contrato. O primeiro acontece após 12 meses e os próximos seguem o mesmo intervalo',
        opcoes: [
          { valor: 'igpm', titulo: 'Pelo IGP-M', descricao: 'Índice da FGV, muito usado em aluguéis.', efeito: 'O aluguel é reajustado a cada 12 meses (só depois dos primeiros 12) pelo IGP-M.', icone: <Percent /> },
          { valor: 'ipca', titulo: 'Pelo IPCA', descricao: 'Índice oficial da inflação, do IBGE.', efeito: 'O aluguel é reajustado a cada 12 meses (só depois dos primeiros 12) pelo IPCA.', icone: <Percent /> },
          { valor: 'fixo', titulo: 'Sem reajuste', descricao: 'O valor continua o mesmo.', efeito: 'O valor do aluguel não muda durante o contrato.', icone: <Lock /> },
        ],
      },
      ...atraso('va', 'aluguel', 'Se o aluguel atrasar', true),
      // Condomínio: só aparece quando o imóvel é em condomínio (escolhido na página 1)
      {
        id: 'va-cond-valor', secao: 'Condomínio', quando: EM_CONDOMINIO, rotulo: 'Taxa do condomínio', tipo: 'moeda',
        label: 'Valor aproximado do condomínio', ajuda: 'Pode ser um valor aproximado. A taxa mensal do condomínio', placeholder: 'R$ 0,00',
      },
      ...atraso('va-cond', 'condomínio', 'Se o condomínio atrasar', false, EM_CONDOMINIO, true),
    ],
  },
  {
    id: 'convivencia',
    numero: 7,
    grupo: 'convivencia',
    titulo: 'Como o imóvel poderá ser usado?',
    lead: 'Combine algumas regras do dia a dia. Em cada pergunta, escolha a opção que vale para este aluguel.',
    perguntas: [
      {
        id: 'co-sublocar', secao: 'Regras do dia a dia', rotulo: 'Sublocar ou emprestar', tipo: 'opcoes', curtas: true,
        legenda: 'Quem está alugando pode sublocar ou emprestar o imóvel?', ajuda: 'Sublocar é alugar o imóvel, ou parte dele, para outra pessoa',
        opcoes: [
          { valor: 'nao', titulo: 'Não pode', descricao: 'Só quem está alugando usa o imóvel.', efeito: 'O contrato proíbe sublocar ou emprestar o imóvel.', icone: <Ban /> },
          { valor: 'autorizacao', titulo: 'Só com autorização', descricao: 'Pede por escrito antes.', efeito: 'Sublocar ou emprestar só com autorização por escrito.', icone: <FileSignature /> },
        ],
      },
      {
        id: 'co-vistoria', rotulo: 'Vistoria de entrada', tipo: 'opcoes', curtas: true,
        legenda: 'Fazer uma vistoria na entrada?', ajuda: 'Vistoria é conferir e anotar o estado do imóvel antes de quem está alugando morar ou usar',
        opcoes: [
          { ...sim('Sim', 'O estado do imóvel fica registrado.', 'O contrato prevê uma vistoria de entrada para registrar o estado do imóvel.', <ClipboardCheck />) },
          { ...nao('Não', 'Sem vistoria registrada.', 'O contrato não prevê vistoria de entrada.', <Ban />) },
        ],
      },
      { id: 'co-vistoria-prazo', rotulo: 'Prazo para questionar a vistoria de entrada', quando: c => c['co-vistoria'] === 'sim', tipo: 'numero', label: 'Em quantos dias quem está alugando pode questionar a vistoria de entrada?', ajuda: 'Prazo, depois da vistoria, para apontar algo que não concorda', unidade: 'dias', min: 1, max: 90 },
      {
        id: 'co-util-locatario', secao: 'Contas do imóvel', rotulo: 'Contas pagas por quem está alugando', tipo: 'multi',
        legenda: 'Quais contas quem está alugando paga diretamente?', ajuda: 'Marque as contas que ficam no nome de quem está alugando e são pagas diretamente por essa pessoa',
        opcoes: UTILIDADES,
      },
      {
        id: 'co-util-restituir', rotulo: 'Contas devolvidas ao proprietário', tipo: 'multi', excluirDe: 'co-util-locatario',
        // some quando todas as contas já foram marcadas como pagas diretamente por quem está alugando (não sobra nada para escolher aqui)
        quando: c => UTILIDADES.some(o => !(c['co-util-locatario'] ?? '').split(',').includes(o.valor)),
        legenda: 'Quais contas continuam no nome do proprietário?', ajuda: 'Marque as contas cujo valor é reembolsado por quem está alugando',
        opcoes: UTILIDADES,
      },
    ],
  },
  {
    id: 'reparos',
    numero: 8,
    grupo: 'reparos',
    agruparSecoes: true,
    titulo: 'E se quem está alugando quiser fazer mudanças no imóvel?',
    lead: 'Defina quais mudanças são permitidas, o que acontece com elas ao final da locação e se haverá reembolso pelos gastos.',
    rodape: {
      texto: 'Os reparos (do dia a dia, urgentes e de emergência) já estão nas cláusulas padrão do contrato e não precisam ser respondidos aqui. Você pode personalizá-los na revisão.',
      discreto: true,
    },
    perguntas: [
      {
        id: 're-obras', rotulo: 'Mudanças no imóvel', tipo: 'opcoes', colunas: 3,
        legenda: 'Quem está alugando pode fazer obras no imóvel?',
        opcoes: [
          { valor: 'nao', titulo: 'Não pode', descricao: 'Nenhuma mudança durante o aluguel.', efeito: 'O contrato não permite mudanças feitas por quem está alugando.', icone: <Ban /> },
          { valor: 'autorizacao', titulo: 'Só com autorização', descricao: 'Pede por escrito antes de começar.', efeito: 'Mudanças só com autorização por escrito do proprietário.', icone: <FileSignature /> },
          { valor: 'pequenas', titulo: 'Só mudanças pequenas', descricao: 'Como pintura e furos na parede.', efeito: 'O contrato permite apenas mudanças pequenas, sem mexer na estrutura.', icone: <Wrench /> },
        ],
      },
      // Acessão (mudanças e construções): o que acontece com as mudanças feitas, inclusive se são indenizáveis ("O proprietário paga").
      // Fica antes das benfeitorias porque pertence ao mesmo assunto das mudanças.
      {
        id: 're-saida', rotulo: 'O que fica das mudanças', tipo: 'opcoes', colunas: 3,
        quando: c => c['re-obras'] === 'autorizacao' || c['re-obras'] === 'pequenas',
        legenda: 'Ao sair, o que acontece com as obras feitas?', ajuda: 'Defina o que foi combinado sobre as obras ao final da locação',
        opcoes: [
          { valor: 'ficam', titulo: 'Ficam no imóvel', descricao: 'Sem pagamento a quem está alugando.', efeito: 'As mudanças ficam no imóvel e quem está alugando não recebe por elas.', icone: <House /> },
          { valor: 'retira', titulo: 'Quem está alugando retira', descricao: 'Leva o que puder tirar.', efeito: 'Quem está alugando retira o que puder sem estragar o imóvel.', icone: <Trash2 /> },
          { valor: 'paga', titulo: 'O proprietário paga', descricao: 'Se a mudança foi autorizada.', efeito: 'O proprietário paga pelas mudanças que autorizou.', icone: <Hammer /> },
        ],
      },
      // Melhorias (as "benfeitorias" do contrato): uma pergunta de sim ou não para cada tipo, só quando quem está alugando pode fazer mudanças.
      // Na tela, cada tipo é descrito em palavras simples; o nome do contrato aparece só como apoio. Os exemplos e as frases precisam de validação jurídica.
      {
        id: 're-benf-necessarias', secao: 'Melhorias no imóvel', secaoAjuda: 'São mudanças feitas no imóvel, como trocar o piso ou instalar armários. No contrato, são chamadas de benfeitorias.', rotulo: 'Melhorias que evitam estragos', tipo: 'opcoes', curtas: true,
        quando: c => c['re-obras'] === 'autorizacao' || c['re-obras'] === 'pequenas',
        legenda: 'No fim da locação, o proprietário devolve o valor das melhorias que evitam estragos no imóvel?', ajuda: 'Por exemplo, consertar um vazamento no telhado. No contrato, são as “benfeitorias necessárias”',
        opcoes: [
          { ...sim('Sim', 'O proprietário devolve o valor.', 'O proprietário devolve a quem está alugando o valor das melhorias que evitam estragos (benfeitorias necessárias) ao final da locação.', <Hammer />) },
          { ...nao('Não', 'O proprietário não devolve o valor.', 'O proprietário não devolve o valor das melhorias que evitam estragos (benfeitorias necessárias) ao final da locação.', <Ban />) },
        ],
      },
      {
        id: 're-benf-uteis', rotulo: 'Melhorias que facilitam o uso', tipo: 'opcoes', curtas: true,
        quando: c => c['re-obras'] === 'autorizacao' || c['re-obras'] === 'pequenas',
        legenda: 'No fim da locação, o proprietário devolve o valor das melhorias que facilitam o uso do imóvel?', ajuda: 'Por exemplo, instalar armários ou uma porta nova. No contrato, são as “benfeitorias úteis”',
        opcoes: [
          { ...sim('Sim', 'O proprietário devolve o valor.', 'O proprietário devolve a quem está alugando o valor das melhorias que facilitam o uso (benfeitorias úteis) ao final da locação.', <Hammer />) },
          { ...nao('Não', 'O proprietário não devolve o valor.', 'O proprietário não devolve o valor das melhorias que facilitam o uso (benfeitorias úteis) ao final da locação.', <Ban />) },
        ],
      },
      {
        id: 're-benf-voluptuarias', rotulo: 'Melhorias de capricho ou conforto', tipo: 'opcoes', curtas: true,
        quando: c => c['re-obras'] === 'autorizacao' || c['re-obras'] === 'pequenas',
        legenda: 'No fim da locação, o proprietário devolve o valor das melhorias só de capricho ou conforto?', ajuda: 'Por exemplo, trocar o piso só por estética. No contrato, são as “benfeitorias voluptuárias”',
        opcoes: [
          { ...sim('Sim', 'O proprietário devolve o valor.', 'O proprietário devolve a quem está alugando o valor das melhorias de capricho ou conforto (benfeitorias voluptuárias) ao final da locação.', <Hammer />) },
          { ...nao('Não', 'O proprietário não devolve o valor.', 'O proprietário não devolve o valor das melhorias de capricho ou conforto (benfeitorias voluptuárias) ao final da locação.', <Ban />) },
        ],
      },
    ],
  },
  {
    id: 'saida',
    numero: 9,
    grupo: 'saida',
    agruparSecoes: true,
    titulo: 'E se o aluguel precisar ser encerrado?',
    lead: 'Defina como o aluguel será garantido e o que deve acontecer quando o imóvel for devolvido.',
    rodape: {
      titulo: 'E os outros assuntos do contrato?',
      texto: 'Alguns assuntos, como visitas, danos ao imóvel, reparos e retomada do imóvel antes do prazo, já vêm com cláusulas padrão. Você não precisa responder nada sobre eles agora. Na revisão, vai ver todos e poderá personalizar só os que quiser.',
    },
    perguntas: [
      {
        id: 'sa-garantia', rotulo: 'Garantia do aluguel', tipo: 'opcoes', colunas: 2,
        legenda: 'Qual será a garantia do aluguel?', ajuda: 'Escolha como o proprietário será protegido em caso de falta de pagamento',
        opcoes: [
          { valor: 'fiador', titulo: 'Fiador', descricao: 'Uma pessoa se compromete a pagar se quem está alugando não pagar.', efeito: 'Um fiador responde pelo aluguel se quem está alugando não pagar.', icone: <Users /> },
          { valor: 'caucao', titulo: 'Depósito (caução)', descricao: 'Um valor fica guardado como garantia.', efeito: 'Um depósito fica como garantia e volta a quem está alugando no fim do contrato, se não houver dívidas.', icone: <Banknote /> },
          { valor: 'seguro', titulo: 'Seguro-fiança', descricao: 'Um seguro contratado paga se houver atraso.', efeito: 'Um seguro-fiança cobre o aluguel em caso de atraso.', icone: <ShieldCheck /> },
          { valor: 'fundo', titulo: 'Fundo de investimento', descricao: 'Aplicações de quem está alugando ficam como garantia.', efeito: 'Aplicações de quem está alugando em um fundo de investimento ficam como garantia do aluguel (cessão fiduciária de quotas) e podem ser usadas se houver dívida.', icone: <Landmark /> },
          { valor: 'nenhuma', titulo: 'Sem garantia', descricao: 'O aluguel não terá garantia.', efeito: 'O contrato não tem garantia para o aluguel.', icone: <Ban /> },
        ],
      },
      { id: 'sa-caucao', rotulo: 'Valor do depósito', tipo: 'numero', quando: c => c['sa-garantia'] === 'caucao', label: 'Quantos aluguéis de depósito?', ajuda: 'O depósito costuma ser de alguns meses de aluguel', unidade: 'aluguéis', min: 1, max: 12 },
      { id: 'sa-fiador', rotulo: 'Fiador', tipo: 'parte', papel: 'fiador', quando: c => c['sa-garantia'] === 'fiador' },
      {
        id: 'sa-multa', rotulo: 'Saída antes do prazo', tipo: 'opcoes', curtas: true,
        legenda: 'E se quem está alugando sair antes do fim do prazo?', ajuda: 'A multa diminui conforme o tempo de aluguel já cumprido. Por exemplo, se o contrato for de 30 meses e a saída acontecer após 24 meses, será cobrada apenas uma parte da multa',
        opcoes: [
          { valor: 'proporcional', titulo: 'Paga multa', descricao: 'Proporcional ao tempo que faltava.', efeito: 'Quem sair antes do prazo paga multa proporcional ao tempo que faltava.', icone: <Scale /> },
          { valor: 'nenhuma', titulo: 'Sem multa', descricao: 'Pode sair avisando antes.', efeito: 'Sair antes do prazo não gera multa.', icone: <DoorOpen /> },
        ],
      },
      // Valor da multa compensatória (por enquanto em número de aluguéis; a unidade ainda precisa ser confirmada com o cliente).
      { id: 'sa-multa-valor', colado: true, rotulo: 'Valor da multa por sair antes do prazo', quando: c => c['sa-multa'] === 'proporcional', tipo: 'numero', label: 'Quantos aluguéis de multa?', ajuda: 'Defina o valor da multa em caso de saída antes do fim do contrato',
        dica: {
          titulo: 'Como a multa é calculada?',
          texto: [
            'A multa diminui proporcionalmente ao tempo que falta para o fim do contrato.',
            'Por exemplo: em um contrato de 30 meses, se quem está alugando sair após 24 meses, restam 6 meses. Nesse caso, paga apenas 1/5 da multa prevista.',
          ],
        },
        unidade: 'aluguéis', min: 1, max: 12 },
      { id: 'sa-aviso', colado: true, rotulo: 'Aviso para sair', tipo: 'numero', label: 'Com quantos dias de aviso?', ajuda: 'Quanto tempo antes quem está alugando avisa que vai sair', unidade: 'dias', min: 1, max: 365 },
      // Isenção da multa depois de um período mínimo (a "desoneração" do mapa do cliente). Os textos precisam de validação jurídica.
      {
        id: 'sa-desoneracao', rotulo: 'Isenção da multa depois de um tempo', tipo: 'opcoes', colunas: 2,
        quando: c => c['sa-multa'] === 'proporcional',
        legenda: 'Depois de um tempo mínimo, a multa deixa de valer?', ajuda: 'É a isenção da multa para quem já cumpriu um período mínimo do contrato e avisa antes de sair',
        opcoes: [
          { valor: 'nao', titulo: 'Não', descricao: 'A multa vale até o fim do contrato.', efeito: 'A multa por sair antes do prazo vale até o fim do contrato.', icone: <Ban /> },
          { valor: 'mes12', titulo: 'A partir do 12º mês', descricao: 'Sem multa, avisando com 30 dias.', efeito: 'Depois do 12º mês, quem sair avisando com 30 dias não paga multa.', icone: <DoorOpen />, quando: mesCabeNoContrato(12) },
          { valor: 'mes24', titulo: 'A partir do 24º mês', descricao: 'Sem multa, avisando com 30 dias.', efeito: 'Depois do 24º mês, quem sair avisando com 30 dias não paga multa.', icone: <DoorOpen />, quando: mesCabeNoContrato(24) },
          { valor: 'outro', titulo: 'Outro', descricao: 'Escolher outro mês e outro aviso.', efeito: 'Depois de um período mínimo, quem sair avisando antes não paga multa.', icone: <Scale /> },
        ],
      },
      { id: 'sa-desoneracao-mes', rotulo: 'Mês em que a isenção começa', quando: c => c['sa-multa'] === 'proporcional' && c['sa-desoneracao'] === 'outro', tipo: 'numero', label: 'A partir de qual mês?', ajuda: 'Número do mês do contrato, por exemplo 18', unidade: 'º mês', min: 1, max: 120 },
      { id: 'sa-desoneracao-aviso', rotulo: 'Aviso para ter a isenção', quando: c => c['sa-multa'] === 'proporcional' && c['sa-desoneracao'] === 'outro', tipo: 'numero', label: 'Com quantos dias de aviso?', ajuda: 'Quanto tempo antes quem está alugando avisa para ter a isenção', unidade: 'dias', min: 1, max: 365 },
      // Vistoria de saída: só sim ou não (os detalhes seguem o texto padrão do contrato). Os textos precisam de validação jurídica.
      {
        id: 'sa-vistoria', rotulo: 'Vistoria de saída', tipo: 'opcoes', curtas: true,
        legenda: 'Fazer uma vistoria na saída?', ajuda: 'É conferir o estado do imóvel quando quem está alugando devolve as chaves',
        opcoes: [
          { ...sim('Sim', 'O estado do imóvel é conferido na devolução.', 'O contrato prevê uma vistoria de saída para conferir o estado do imóvel na devolução.', <ClipboardCheck />) },
          { ...nao('Não', 'Sem vistoria na devolução.', 'O contrato não prevê vistoria de saída.', <Ban />) },
        ],
      },
    ],
  },
];

export const PAGINA_POR_ID: Record<PaginaFluxo, PaginaDef> = Object.fromEntries(PAGINAS.map(p => [p.id, p])) as Record<PaginaFluxo, PaginaDef>;

const PREFIXO_DA_PAGINA: Record<string, PaginaFluxo> = { im: 'imovel', va: 'valores', co: 'convivencia', re: 'reparos', sa: 'saida' };

/** Em que página (das 5 a 9) fica um item do resumo, pelo prefixo do id. Devolve `undefined` se não for de nenhuma. */
export function paginaFluxoDoItem(item?: string): PaginaFluxo | undefined {
  if (!item) return undefined;
  const m = /^([a-z]{2})-/.exec(item);
  return m ? PREFIXO_DA_PAGINA[m[1]] : undefined;
}

export const perguntaVisivel = (p: Pergunta, c: Contrato, ctx: { imovel?: Imovel }): boolean => !p.quando || p.quando(c, ctx);

// ───────── formatos ─────────
export const soNumeros = (v: string): string => v.replace(/\D/g, '');

/** "150000" → "R$ 1.500,00". Digita-se só números; os centavos entram sozinhos. */
export function formatarMoeda(v: string): string {
  const n = soNumeros(v).slice(0, 10);
  if (!n) return '';
  return (Number(n) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
}

/** Só números e uma vírgula, até 2 casas: "2,5". */
export function formatarPercentual(v: string): string {
  const limpo = v.replace(/[^\d,]/g, '');
  const [inteiro, ...resto] = limpo.split(',');
  const dec = resto.join('').slice(0, 2);
  return (limpo.includes(',') ? `${inteiro.slice(0, 3)},${dec}` : inteiro.slice(0, 3));
}

/** "2026-03-01" → "01/03/2026". */
export const formatarData = (iso: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso);

/** Erro de uma pergunta visível (ou `undefined` se estiver ok). */
export function erroDaPergunta(p: Pergunta, c: Contrato): string | undefined {
  // uma resposta que deixou de ser oferecida (por exemplo, "a partir do 24º mês" depois de o contrato ficar mais curto) pede nova escolha
  if (p.tipo === 'opcoes') return opcoesVisiveis(p.opcoes, c).some(o => o.valor === c[p.id]) ? undefined : `Escolha uma opção em “${p.rotulo}”.`;
  if (p.tipo === 'multi') return undefined; // marcar nada também é uma resposta
  if (p.tipo === 'inventario') {
    const e = errosDoInventario(lerInventario(c, p.id));
    return e.geral ?? (e.linhas.some(l => l.item || l.qtd) ? 'Corrija os itens marcados.' : undefined);
  }
  if (p.tipo === 'parte') return Object.keys(validarParte(lerParteDaResposta(c, p.id), p.papel)).length > 0 ? 'Preencha os dados do fiador.' : undefined;
  if (p.tipo === 'endereco') {
    if (soNumeros(c['im-cep'] ?? '').length !== 8) return 'Informe o CEP com 8 números.';
    if (!(c['im-logradouro'] ?? '').trim()) return 'Informe a rua ou avenida.';
    if (!(c['im-numero'] ?? '').trim()) return 'Informe o número (ou "s/n").';
    if (!(c['im-bairro'] ?? '').trim()) return 'Informe o bairro.';
    if (!(c['im-cidade'] ?? '').trim()) return 'Informe a cidade.';
    if (!(c['im-uf'] ?? '').trim()) return 'Escolha o estado.';
    return undefined;
  }
  const v = (c[p.id] ?? '').trim();
  if (!v) return p.opcional ? undefined : 'Preencha este campo.';
  if (p.tipo === 'numero') {
    const n = Number(v);
    if (!Number.isInteger(n) || (p.min !== undefined && n < p.min) || (p.max !== undefined && n > p.max)) return `Informe um número de ${p.min ?? 0} a ${p.max}.`;
    // o mês em que a isenção começa não pode passar da duração do contrato (página 5)
    if (p.id === 'sa-desoneracao-mes') {
      const prazo = Number(c['va-prazo']);
      if (Number.isInteger(prazo) && prazo > 0 && n > prazo) return `O contrato dura ${prazo} ${prazo === 1 ? 'mês' : 'meses'}. Informe um mês de 1 a ${prazo}.`;
    }
  }
  if (p.tipo === 'moeda' && Number(soNumeros(v)) <= 0) return 'Informe um valor maior que zero.';
  if (p.tipo === 'percentual') {
    const n = Number(v.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0 || n > 100) return 'Informe uma porcentagem entre 0 e 100.';
  }
  return undefined;
}

/** Quantas perguntas desta página ainda faltam (só as que aparecem). */
export function lacunasDaPagina(pagina: PaginaDef, c: Contrato, ctx: { imovel?: Imovel }): number {
  return pagina.perguntas.filter(p => perguntaVisivel(p, c, ctx) && erroDaPergunta(p, c)).length;
}

/** O valor de uma resposta como aparece no resumo. Vazio se não foi respondida. */
export function valorNoResumo(p: Pergunta, c: Contrato): string {
  if (p.tipo === 'opcoes') return p.opcoes.find(o => o.valor === c[p.id])?.titulo ?? '';
  if (p.tipo === 'parte') return lerParteDaResposta(c, p.id).nome.trim();
  if (p.tipo === 'inventario') {
    const n = itensDoInventario(c, p.id).length;
    return n === 0 ? '' : `${n} ${n === 1 ? 'item' : 'itens'}`;
  }
  if (p.tipo === 'multi') {
    if (!(p.id in c)) return '';
    const marcados = p.opcoes.filter(o => (c[p.id] ?? '').split(',').includes(o.valor)).map(o => o.titulo);
    return marcados.length ? marcados.join(', ') : 'Nenhum';
  }
  if (p.tipo === 'endereco') {
    const rua = [c['im-logradouro'], c['im-numero']].filter(Boolean).join(', ');
    const compl = c['im-complemento'] ? ` ${c['im-complemento']}` : '';
    const local = [c['im-bairro'], [c['im-cidade'], c['im-uf']].filter(Boolean).join('/')].filter(Boolean).join(' · ');
    return [rua + compl, local].filter(Boolean).join(' - ');
  }
  const v = (c[p.id] ?? '').trim();
  if (!v) return '';
  if (p.tipo === 'data') return formatarData(v);
  if (p.tipo === 'percentual') return `${v}%`;
  if (p.id === 'va-vencimento') return `Todo dia ${v}`;
  if (p.id === 'sa-multa-valor') return `${v} ${Number(v) === 1 ? 'aluguel' : 'aluguéis'}`;
  if (p.id === 'sa-desoneracao-mes') return `${v}º mês`;
  if (p.id === 'sa-desoneracao-aviso') return `${v} ${Number(v) === 1 ? 'dia' : 'dias'}`;
  if (p.id === 'sa-aviso') return `${v} ${Number(v) === 1 ? 'dia' : 'dias'}`;
  if (p.id === 'sa-caucao') return `${v} ${Number(v) === 1 ? 'aluguel' : 'aluguéis'}`;
  if (p.unidade) return `${v} ${p.unidade}`;
  return v;
}

export const efeitoDaResposta = (p: Pergunta, c: Contrato): string | undefined => (p.tipo === 'opcoes' ? p.opcoes.find(o => o.valor === c[p.id])?.efeito : undefined);

// ───────── pontos que seguem as cláusulas padrão ─────────

/**
 * Assuntos do contrato que NÃO viram pergunta: o contrato já traz as cláusulas padrão. Na revisão, a pessoa vê o que o
 * padrão estabelece (`padrao`, em uma frase simples e sem o texto da cláusula) e, se não servir, escolhe entre as
 * alternativas previstas (`opcoes`) ou, em último caso, "Outro": escreve o que quer, e isso entra no contrato exatamente
 * como foi digitado. O sistema não reescreve nem confere o texto, por isso as alternativas previstas vêm primeiro.
 * As frases e alternativas abaixo são uma PROPOSTA de redação: precisam ser conferidas e ajustadas com o cliente e o
 * jurídico para dizerem exatamente o que o modelo de contrato prevê.
 */
export interface OpcaoPonto {
  valor: string; titulo: string; frase: string;
  /** Só oferece esta alternativa quando devolve verdadeiro (por exemplo, para não repetir o que o padrão já é). */
  quando?: (c: Contrato) => boolean;
}
/** As alternativas de um ponto que fazem sentido com as respostas de agora. */
export const opcoesDoPonto = (ponto: PontoPadrao, c: Contrato): OpcaoPonto[] => ponto.opcoes.filter(o => !o.quando || o.quando(c));
export type GrupoPadraoId = 'uso' | 'condominio' | 'impostos' | 'reparos' | 'fim';
/** Subdivisões das cláusulas padrão na revisão, para a pessoa achar e conferir um assunto de cada vez (ex.: tudo de reparos junto). */
export const GRUPOS_PADRAO: Array<{ id: GrupoPadraoId; titulo: string }> = [
  { id: 'uso', titulo: 'Uso e convivência' },
  { id: 'condominio', titulo: 'Condomínio' },
  { id: 'impostos', titulo: 'Impostos e taxas' },
  { id: 'reparos', titulo: 'Reparos' },
  { id: 'fim', titulo: 'Fim do contrato e devolução' },
];
export interface PontoPadrao {
  id: string;
  grupo: GrupoPadraoId;
  titulo: string;
  padrao: string;
  opcoes: OpcaoPonto[];
  /** Só aparece quando o imóvel é em condomínio. */
  soEmCondominio?: boolean;
  /** Só aparece quando devolve verdadeiro (depende das respostas do formulário). */
  quando?: (c: Contrato) => boolean;
}

/** O imóvel é em condomínio? */
export const imovelEmCondominio = (imovel?: Imovel | null): boolean => EM_CONDOMINIO({}, { imovel: imovel ?? undefined });
/** Pontos de cláusulas padrão que valem para o imóvel (os do condomínio só aparecem para imóvel em condomínio). */
export const pontosPadraoDoImovel = (imovel?: Imovel | null, c: Contrato = {}): PontoPadrao[] =>
  PONTOS_PADRAO.filter(p => (!p.soEmCondominio || imovelEmCondominio(imovel)) && (!p.quando || p.quando(c)));

export const PONTOS_PADRAO: PontoPadrao[] = [
  // Impostos e taxas: antes era uma pergunta do formulário (marcar o que quem está alugando paga); agora já vem como cláusula padrão e a pessoa
  // só muda se quiser, na revisão. O padrão e as alternativas são uma proposta e precisam de validação jurídica.
  {
    id: 'pm-impostos', grupo: 'impostos', titulo: 'Impostos e taxas do imóvel',
    padrao: 'O proprietário paga os impostos e as taxas do imóvel, como o IPTU.',
    opcoes: [
      { valor: 'inquilino-iptu', titulo: 'Quem está alugando paga o IPTU', frase: 'Quem está alugando paga o IPTU. As demais taxas e impostos do imóvel ficam por conta do proprietário.' },
      { valor: 'inquilino-iptu-taxas', titulo: 'Quem está alugando paga o IPTU e as taxas', frase: 'Quem está alugando paga o IPTU e as taxas do imóvel. Os demais impostos ficam por conta do proprietário.' },
      { valor: 'inquilino-todos', titulo: 'Quem está alugando paga todos', frase: 'Quem está alugando paga todos os impostos e taxas do imóvel.' },
    ],
  },
  // Condomínio: antes eram perguntas do formulário; agora já vêm como cláusula padrão e a pessoa só muda se quiser, na revisão.
  // Os padrões e as alternativas são uma proposta e precisam de validação jurídica.
  {
    id: 'pm-cond-ordinarias', grupo: 'condominio', soEmCondominio: true, titulo: 'Despesas ordinárias do condomínio',
    padrao: 'As despesas do dia a dia do condomínio, como limpeza e portaria, ficam por conta de quem está alugando.',
    opcoes: [{ valor: 'proprietario', titulo: 'O proprietário paga', frase: 'As despesas ordinárias do condomínio, como limpeza e portaria, ficam por conta do proprietário.' }],
  },
  {
    id: 'pm-cond-extra', grupo: 'condominio', soEmCondominio: true, titulo: 'Despesas extraordinárias do condomínio',
    padrao: 'Os gastos fora do comum, como obras e reformas do prédio, ficam por conta do proprietário.',
    opcoes: [{ valor: 'inquilino', titulo: 'Quem está alugando paga', frase: 'As despesas extraordinárias do condomínio, como obras e reformas do prédio, ficam por conta de quem está alugando.' }],
  },
  {
    id: 'pm-cond-multas', grupo: 'condominio', soEmCondominio: true, titulo: 'Multas do condomínio',
    padrao: 'As multas aplicadas pelo condomínio ficam com quem deu motivo a elas.',
    opcoes: [
      { valor: 'inquilino', titulo: 'Quem está alugando paga todas', frase: 'Todas as multas aplicadas pelo condomínio ficam por conta de quem está alugando.' },
      { valor: 'proprietario', titulo: 'O proprietário paga todas', frase: 'Todas as multas aplicadas pelo condomínio ficam por conta do proprietário.' },
    ],
  },
  {
    // Só aparece se a pessoa disse "sim" para juros ou multa no atraso do condomínio. Usa o índice que ela escolheu para o aluguel.
    id: 'pm-cond-correcao', grupo: 'condominio', soEmCondominio: true, titulo: 'Correção do condomínio em atraso',
    quando: c => c['va-cond-juros'] === 'sim' || c['va-cond-multa'] === 'sim',
    padrao: 'O valor do condomínio em atraso é corrigido pelo mesmo índice escolhido para o aluguel.',
    // as mesmas opções de índice do aluguel, menos a que já é o padrão (o índice escolhido para o aluguel)
    opcoes: [
      { valor: 'igpm', titulo: 'IGP-M', frase: 'O valor do condomínio em atraso é corrigido pelo IGP-M.', quando: c => c['va-correcao'] !== 'igpm' },
      { valor: 'ipca', titulo: 'IPCA', frase: 'O valor do condomínio em atraso é corrigido pelo IPCA.', quando: c => c['va-correcao'] !== 'ipca' },
    ],
  },
  {
    id: 'pm-cond-servicos', grupo: 'condominio', soEmCondominio: true, titulo: 'Serviços disponibilizados pelo condomínio',
    padrao: 'Quem está alugando pode usar os serviços e as áreas comuns do condomínio, seguindo o regulamento.',
    opcoes: [
      { valor: 'inquilino-paga', titulo: 'Quem está alugando paga pelos serviços', frase: 'Quem está alugando pode usar os serviços do condomínio e paga o que for cobrado por eles.' },
      { valor: 'proprietario-paga', titulo: 'O proprietário paga pelos serviços', frase: 'Quem está alugando pode usar os serviços do condomínio e o proprietário paga o que for cobrado por eles.' },
    ],
  },
  {
    id: 'pm-retomada', grupo: 'fim', titulo: 'Retomada do imóvel antes do prazo',
    padrao: 'O proprietário só pode pedir o imóvel de volta antes do fim do prazo nos casos que a lei permite.',
    opcoes: [{ valor: 'so-descumprimento', titulo: 'Só se o contrato for descumprido', frase: 'O proprietário só pode pedir o imóvel de volta antes do prazo se quem está alugando descumprir o contrato.' }],
  },
  {
    id: 'pm-destinacao', grupo: 'uso', titulo: 'Destinação do imóvel',
    padrao: 'O imóvel só pode ser usado para o fim escolhido no início (moradia ou negócio), sem mudar o uso sem autorização.',
    opcoes: [
      { valor: 'sem-mudanca', titulo: 'Nunca muda o uso', frase: 'O imóvel só pode ser usado para o fim escolhido no início. O uso não pode ser mudado durante o contrato.' },
      { valor: 'com-aviso', titulo: 'Pode mudar com autorização por escrito', frase: 'O uso do imóvel só pode ser mudado com autorização por escrito do proprietário.' },
    ],
  },
  {
    id: 'pm-convivencia', grupo: 'uso', titulo: 'Convivência',
    padrao: 'Quem está alugando respeita as regras do prédio e da vizinhança, como silêncio e uso das áreas comuns.',
    opcoes: [{ valor: 'regimento', titulo: 'Seguir só o regulamento do condomínio', frase: 'Quem está alugando segue o regulamento do condomínio, sem outras regras de convivência no contrato.' }],
  },
  // Animais de estimação: antes era uma pergunta da página "Como o imóvel poderá ser usado?"; agora já vem como cláusula padrão (só com
  // autorização do proprietário) e a pessoa só muda se quiser, na revisão. O padrão e as alternativas são uma proposta e precisam de validação jurídica.
  {
    id: 'pm-animais', grupo: 'uso', titulo: 'Animais de estimação',
    padrao: 'Quem está alugando só pode ter animais de estimação no imóvel com autorização do proprietário.',
    opcoes: [
      { valor: 'pode', titulo: 'Pode ter animais', frase: 'Quem está alugando pode ter animais de estimação no imóvel.' },
      { valor: 'nao', titulo: 'Não pode ter animais', frase: 'Não é permitido ter animais de estimação no imóvel.' },
    ],
  },
  {
    // O padrão já segue o aviso e a multa escolhidos na página de saída (a frase usa as respostas dela). Por isso não há outra alternativa pronta:
    // só resta escrever outro texto em "Outro". Os textos precisam de validação jurídica.
    id: 'pm-devolucao', grupo: 'fim', titulo: 'Devolução antecipada',
    padrao: 'A devolução antes do prazo segue o aviso e a multa escolhidos na página de saída e garantias.',
    opcoes: [],
  },
  {
    id: 'pm-visitas', grupo: 'uso', titulo: 'Visitas pelo proprietário ou por terceiros',
    padrao: 'O proprietário, ou quem ele indicar, pode visitar o imóvel combinando dia e hora antes.',
    opcoes: [{ valor: 'urgencia', titulo: 'Só em caso de urgência', frase: 'O proprietário só pode visitar o imóvel em caso de urgência ou com autorização de quem está alugando.' }],
  },
  {
    id: 'pm-danos', grupo: 'fim', titulo: 'Danos ao imóvel',
    padrao: 'Quem está alugando responde pelos estragos que causar no imóvel, além do desgaste normal do uso.',
    opcoes: [
      { valor: 'so-piorou', titulo: 'Só o que piorou desde a entrada', frase: 'Quem está alugando responde só pelo que piorou no imóvel desde a vistoria de entrada, sem contar o desgaste normal.' },
      { valor: 'so-descuido', titulo: 'Só danos por descuido ou de propósito', frase: 'Quem está alugando responde apenas pelos danos que causar por descuido ou de propósito.' },
    ],
  },
  {
    id: 'pm-reparos-ordinarios', grupo: 'reparos', titulo: 'Reparos do dia a dia (ordinários)',
    padrao: 'Os reparos pequenos do dia a dia, como trocar uma torneira ou uma lâmpada, ficam por conta de quem está alugando. Se ele não fizer e o imóvel estragar, responde pelos danos na saída.',
    opcoes: [{ valor: 'proprietario', titulo: 'Ficam por conta do proprietário', frase: 'Os reparos pequenos do dia a dia ficam por conta do proprietário.' }],
  },
  {
    id: 'pm-reparos-urgentes', grupo: 'reparos', titulo: 'Reparos urgentes (de estrutura ou que afetam a moradia)',
    padrao: 'Ficam por conta do proprietário, e quem está alugando precisa permitir a entrada para a obra. Se a obra durar mais de 10 dias, o aluguel pode ser reduzido na proporção; se passar de 30 dias, quem está alugando pode encerrar o contrato sem multa.',
    opcoes: [{ valor: 'dividir', titulo: 'Custos combinados caso a caso', frase: 'Os custos dos reparos urgentes são combinados caso a caso entre o proprietário e quem está alugando.' }],
  },
  {
    id: 'pm-reparos-emergencia', grupo: 'reparos', titulo: 'Reparos de emergência (risco imediato)',
    padrao: 'Ficam por conta do proprietário, mas quem está alugando (ou a administradora) deve agir na hora para conter o problema e avisar em até 24 horas. Se o proprietário não agir, quem está alugando pode fazer o conserto e pedir o reembolso imediato ou o desconto no aluguel.',
    opcoes: [{ valor: 'so-avisa', titulo: 'Quem está alugando só avisa', frase: 'Em emergência, quem está alugando só avisa o proprietário, que resolve e paga.' }],
  },
];

/** Resposta de um ponto: `undefined` = cláusulas padrão; o `valor` de uma alternativa; ou `'outro'` (texto em `<id>-texto`). */
export const OUTRO = 'outro';
export const chaveDoTexto = (id: string): string => `${id}-texto`;

/** O ponto foi personalizado (alternativa ou "Outro" com texto)? */
export function pontoPersonalizado(ponto: PontoPadrao, c: Contrato): boolean {
  const v = c[ponto.id];
  if (v === OUTRO) return (c[chaveDoTexto(ponto.id)] ?? '').trim() !== '';
  return !!v && ponto.opcoes.some(o => o.valor === v);
}

/** A frase do ponto como fica no contrato: o padrão, a alternativa escolhida ou o texto digitado. */
export function frasePonto(ponto: PontoPadrao, c: Contrato): string {
  if (!pontoPersonalizado(ponto, c)) return ponto.id === 'pm-devolucao' ? fraseDaDevolucao(c, ponto.padrao) : ponto.id === 'pm-cond-correcao' ? fraseDaCorrecaoDoCondominio(c, ponto.padrao) : ponto.padrao;
  const v = c[ponto.id];
  return v === OUTRO ? (c[chaveDoTexto(ponto.id)] ?? '').trim() : (ponto.opcoes.find(o => o.valor === v)?.frase ?? ponto.padrao);
}

/** Correção do condomínio em atraso: usa o índice escolhido para o aluguel (ou o texto geral, se ainda não escolheu). */
function fraseDaCorrecaoDoCondominio(c: Contrato, padrao: string): string {
  const indice = ({ igpm: 'IGP-M', ipca: 'IPCA' } as Record<string, string>)[c['va-correcao'] ?? ''];
  return indice ? `O valor do condomínio em atraso é corrigido pelo ${indice}, o mesmo índice escolhido para o aluguel.` : padrao;
}

/** Devolução antecipada: mostra o aviso e a multa que a pessoa já escolheu na página de saída (ou o texto geral, se ainda não escolheu). */
function fraseDaDevolucao(c: Contrato, padrao: string): string {
  const aviso = Number(c['sa-aviso']);
  const multa = c['sa-multa'];
  if (!Number.isInteger(aviso) || aviso < 1 || !multa) return padrao;
  const dias = aviso === 1 ? '1 dia' : `${aviso} dias`;
  if (multa === 'nenhuma') return `A devolução antes do prazo segue o aviso de ${dias} e não tem multa, como escolhido na página de saída e garantias.`;
  const n = Number(c['sa-multa-valor']);
  const valorDaMulta = Number.isInteger(n) && n > 0 ? `a multa de ${n} ${n === 1 ? 'aluguel' : 'aluguéis'}, proporcional ao tempo que faltava` : 'a multa proporcional ao tempo que faltava';
  const isencao = ({ mes12: [12, 30], mes24: [24, 30], outro: [Number(c['sa-desoneracao-mes']), Number(c['sa-desoneracao-aviso'])] } as Record<string, number[]>)[c['sa-desoneracao'] ?? ''];
  const textoIsencao = isencao && isencao[0] > 0 && isencao[1] > 0 ? `, com isenção a partir do ${isencao[0]}º mês avisando com ${isencao[1]} dias` : '';
  return `A devolução antes do prazo segue o aviso de ${dias} e ${valorDaMulta}${textoIsencao}, como escolhido na página de saída e garantias.`;
}

/** Limite de caracteres do texto personalizado: evita mexer demais no modelo. */
export const MAX_PERSONALIZADO = 400;

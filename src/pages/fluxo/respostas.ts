/**
 * Respostas do preenchimento, compartilhadas entre as telas do fluxo.
 * No protótipo ficam em sessionStorage (somem ao fechar a aba) só para as telas, que são stories separadas,
 * conseguirem "lembrar" o que foi preenchido ao ir e voltar. No produto real isso é estado em memória: o documento
 * e os dados pessoais não são guardados em nenhum lugar (ver escopo).
 */
export type Uso = 'residencial' | 'comercial';
export type Imovel = 'casa-condominio' | 'apartamento-condominio' | 'casa-fora' | 'condominio' | 'fora-condominio';
export type TipoLocador = 'pessoa' | 'empresa';

export const TITULO_USO: Record<Uso, string> = { residencial: 'Residencial', comercial: 'Comercial' };
export const TITULO_IMOVEL: Record<Imovel, string> = {
  'casa-condominio': 'Casa em condomínio',
  'apartamento-condominio': 'Apartamento em condomínio',
  'casa-fora': 'Casa fora de condomínio',
  condominio: 'Em condomínio',
  'fora-condominio': 'Fora de condomínio',
};

/**
 * Dados do cônjuge anuente de uma pessoa casada. Ficam dentro da própria pessoa (em Pessoas envolvidas), não numa seção à parte.
 * O cônjuge assina como anuente: não é proprietário nem inquilino. A lista de campos é uma proposta e PRECISA ser validada pelo jurídico.
 */
export interface DadosConjuge { nome: string; documento: string; nacionalidade: string; profissao: string }
export const CONJUGE_VAZIO: DadosConjuge = { nome: '', documento: '', nacionalidade: '', profissao: '' };

/** Dados de uma parte (proprietário, inquilino ou imobiliária). Para empresa, `nome` é a razão social. */
export interface DadosLocador {
  tipo: TipoLocador | '';
  nome: string;
  documento: string;
  representante: string;
  nacionalidade: string;
  profissao: string;
  estadoCivil: string;
  regimeBens: string;
  /** Cônjuge anuente (só para quem é casado(a)). Preenchido quando o prazo do contrato pede a autorização. */
  conjuge?: DadosConjuge;
  /** Responsável pela intermediação (corretor ou imobiliária): o CRECI. `nome` e `documento` são o nome e o CPF (corretor) ou o CNPJ (imobiliária). */
  creci: string;
  /** Responsável pela intermediação: o CPF do representante legal, quando o cadastro é de uma imobiliária (o nome dele usa o campo `representante`). */
  representanteCpf: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export const LOCADOR_VAZIO: DadosLocador = {
  tipo: '', nome: '', documento: '', representante: '', nacionalidade: '', profissao: '', estadoCivil: '', regimeBens: '',
  creci: '', representanteCpf: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
};

/**
 * O responsável pela intermediação usa o mesmo formato, num cadastro único: corretor (CPF e CRECI) ou imobiliária (CNPJ, CRECI e
 * representante legal). Ninguém escolhe o tipo: ele vem do documento digitado. O endereço é o de sempre.
 */
export const IMOBILIARIA_VAZIA: DadosLocador = { ...LOCADOR_VAZIO, tipo: 'pessoa' };

/**
 * Uma "parte" que pode ter mais de uma pessoa: o proprietário (locador) ou quem está alugando (locatário).
 * `maisDeUm`: haverá mais de uma pessoa? `compartilhado`: como ficam as responsabilidades entre elas (veja `resumo.ts`).
 * O segundo cadastro é guardado mesmo se a pessoa voltar atrás em "mais de um", para não apagar o que ela digitou.
 * Não há limite de pessoas: a terceira em diante ficam em `outros`, na ordem em que foram adicionadas.
 */
export interface ParteResp {
  principal: DadosLocador;
  segundo: DadosLocador;
  /** Terceira pessoa em diante (só valem quando `maisDeUm` é verdadeiro). */
  outros?: DadosLocador[];
  maisDeUm: boolean | null;
  /** Proprietários: `true` = qualquer um pode cobrar o valor todo; `false` = cada um cobra sua parte.
   *  Inquilinos: `true` = todos respondem pelo valor total; `false` = cada um responde pela sua parte. */
  compartilhado: boolean | null;
}

export const PARTE_VAZIA: ParteResp = { principal: LOCADOR_VAZIO, segundo: LOCADOR_VAZIO, maisDeUm: null, compartilhado: null };

export type Administracao = 'imobiliaria' | 'proprio';

export interface Respostas {
  uso?: Uso;
  imovel?: Imovel;
  locador?: ParteResp;
  locatario?: ParteResp;
  /** Quem administra o aluguel: uma imobiliária/corretor ou o próprio proprietário. */
  administracao?: Administracao;
  imobiliaria?: DadosLocador;
  /** Uso do imóvel no momento em que os dados das pessoas foram preenchidos (para avisar se mudou depois). */
  usoAoPreencherLocador?: Uso;
  /** Respostas das páginas 5 a 9 (imóvel, valores, convivência, reparos, saída): id da pergunta → valor. */
  contrato?: Contrato;
}

/** Respostas simples das páginas 5 a 9. Opção escolhida = o `valor` dela; campo digitado = o texto (já formatado). */
export type Contrato = Record<string, string>;

const CHAVE = 'legal-design.respostas.v2';

/** Tipos de imóvel que cada uso oferece (a mesma lista da primeira página). Serve para descartar uma escolha que não vale mais. */
const IMOVEIS_POR_USO: Record<Uso, Imovel[]> = {
  residencial: ['casa-condominio', 'apartamento-condominio', 'casa-fora'],
  comercial: ['condominio', 'fora-condominio'],
};

export function lerRespostas(): Respostas {
  try {
    const r = JSON.parse(sessionStorage.getItem(CHAVE) ?? '{}') as Respostas;
    // um tipo de imóvel que o uso escolhido não oferece (por exemplo, sobra de uma versão anterior) não vale: a pessoa escolhe de novo
    if (r.uso && r.imovel && !IMOVEIS_POR_USO[r.uso].includes(r.imovel)) delete r.imovel;
    return r;
  } catch { return {}; }
}

export function salvarRespostas(parcial: Partial<Respostas>): void {
  try { sessionStorage.setItem(CHAVE, JSON.stringify({ ...lerRespostas(), ...parcial })); } catch { /* sem storage */ }
}

/** Guarda respostas das páginas 5 a 9 sem apagar as das outras páginas. */
export function salvarContrato(parcial: Contrato): void {
  salvarRespostas({ contrato: { ...lerRespostas().contrato, ...parcial } });
}

/** Começa um preenchimento do zero (usado ao entrar no formulário pela página inicial). */
export function limparRespostas(): void {
  try { sessionStorage.removeItem(CHAVE); } catch { /* sem storage */ }
}

/** Há alguma informação preenchida nesta parte? */
export const parteTemDados = (p?: ParteResp): boolean => !!p && p.principal.nome.trim() !== '';

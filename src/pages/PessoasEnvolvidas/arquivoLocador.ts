import { LOCADOR_VAZIO, type DadosConjuge, type DadosLocador } from '../fluxo/respostas';

export type Papel = 'locador' | 'imobiliaria';

/** Marca do arquivo: só aceitamos arquivos salvos por esta tela, e cada papel só importa o seu. */
const FORMATO: Record<Papel, string> = { locador: 'dados-do-locador', imobiliaria: 'dados-da-imobiliaria' };
/** Versão 1: uma pessoa (`dados`). Versão 2: uma ou duas pessoas (`pessoas`). Os dois formatos são lidos. */
const VERSAO = 2;
const LIMITE_TEXTO = 200;
const LIMITE_ARQUIVO = 64 * 1024;
const MAX_PESSOAS = 20;

export const NOME_DO_ARQUIVO: Record<Papel, string> = { locador: 'dados-do-locador.json', imobiliaria: 'dados-da-imobiliaria.json' };

/**
 * Baixa um arquivo .json com os dados informados, só no computador da pessoa: nada é enviado para servidor.
 * Pode levar uma ou mais pessoas (por exemplo, vários proprietários). O nome do arquivo não carrega nome nem documento,
 * para não expor dados no nome da pasta ou do download.
 */
export function salvarArquivoLocador(dados: DadosLocador | DadosLocador[], papel: Papel): void {
  // o cônjuge anuente vai junto com a pessoa a que está ligado, mas só se tiver algo preenchido
  const pessoas = (Array.isArray(dados) ? dados : [dados]).slice(0, MAX_PESSOAS).map(p => (p.conjuge && CAMPOS_CONJUGE.some(c => p.conjuge![c].trim() !== '') ? p : { ...p, conjuge: undefined }));
  const conteudo = JSON.stringify({ formato: FORMATO[papel], versao: VERSAO, pessoas }, null, 2);
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = NOME_DO_ARQUIVO[papel];
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const CAMPOS_CONJUGE: Array<keyof DadosConjuge> = ['nome', 'documento', 'nacionalidade', 'profissao'];

/** Pega só os campos conhecidos, como texto curto; ignora o resto. */
function limpar(bruto: Record<string, unknown>, papel: Papel): DadosLocador {
  const lido: DadosLocador = { ...LOCADOR_VAZIO };
  (Object.keys(LOCADOR_VAZIO) as Array<keyof DadosLocador>).forEach(chave => {
    const valor = bruto[chave];
    if (typeof valor === 'string') (lido[chave] as string) = valor.slice(0, LIMITE_TEXTO);
  });
  // cônjuge anuente: só os quatro campos conhecidos, como texto curto
  const conj = bruto.conjuge;
  if (conj && typeof conj === 'object') {
    const c = conj as Record<string, unknown>;
    const lidoConj = { nome: '', documento: '', nacionalidade: '', profissao: '' } as DadosConjuge;
    CAMPOS_CONJUGE.forEach(k => { if (typeof c[k] === 'string') lidoConj[k] = (c[k] as string).slice(0, LIMITE_TEXTO); });
    if (CAMPOS_CONJUGE.some(k => lidoConj[k].trim() !== '')) lido.conjuge = lidoConj;
  }
  if (papel === 'imobiliaria') lido.tipo = 'pessoa';
  else if (lido.tipo !== 'pessoa' && lido.tipo !== 'empresa') lido.tipo = '';
  return lido;
}

/**
 * Lê e valida um arquivo salvo antes e devolve as pessoas que ele traz (uma ou mais). Aceita o formato antigo, de uma só pessoa.
 * Lança `Error` se não servir.
 */
export async function lerArquivoPessoas(arquivo: File, papel: Papel): Promise<DadosLocador[]> {
  if (arquivo.size > LIMITE_ARQUIVO) throw new Error('arquivo-grande');
  let json: unknown;
  try { json = JSON.parse(await arquivo.text()); } catch { throw new Error('arquivo-invalido'); }

  const raiz = json as { formato?: unknown; versao?: unknown; dados?: unknown; pessoas?: unknown };
  if (!raiz || raiz.formato !== FORMATO[papel]) throw new Error('arquivo-invalido');

  const brutos = Array.isArray(raiz.pessoas) ? raiz.pessoas : raiz.dados !== undefined ? [raiz.dados] : [];
  const pessoas = brutos
    .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
    .slice(0, MAX_PESSOAS)
    .map(b => limpar(b, papel));
  if (pessoas.length === 0) throw new Error('arquivo-invalido');
  return pessoas;
}

/** Como `lerArquivoPessoas`, mas só com a primeira pessoa (usado onde há uma pessoa só). */
export async function lerArquivoLocador(arquivo: File, papel: Papel): Promise<DadosLocador> {
  return (await lerArquivoPessoas(arquivo, papel))[0];
}

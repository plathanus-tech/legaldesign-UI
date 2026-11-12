import { cpfValido } from '../PessoasEnvolvidas/formatos';
import type { Contrato, DadosConjuge, DadosLocador, ParteResp } from './respostas';

/**
 * Anuência conjugal: quando o prazo do contrato é de 120 meses (10 anos) ou mais, cada pessoa casada(o) entre as partes pode
 * precisar do cônjuge como anuente (autoriza o contrato e assina à parte). A regra é verificada pessoa a pessoa: não se presume
 * que todas têm o mesmo estado civil.
 *
 * ATENÇÃO (validação jurídica): o prazo de corte, quais estados civis exigem a anuência (aqui, só "Casado(a)"; união estável e
 * regime de bens ficam de fora), se vale para locador e locatário, e a lista de campos do cônjuge são propostas. Nada disso foi
 * validado.
 */
export const PRAZO_ANUENCIA_MESES = 120;
export const ESTADO_CIVIL_ANUENCIA = 'Casado(a)';

export const prazoEmMeses = (c?: Contrato): number => Number((c?.['va-prazo'] ?? '').replace(/\D/g, '')) || 0;
export const exigeAnuencia = (c?: Contrato): boolean => prazoEmMeses(c) >= PRAZO_ANUENCIA_MESES;
export const estaCasado = (d: DadosLocador): boolean => d.tipo === 'pessoa' && d.estadoCivil === ESTADO_CIVIL_ANUENCIA;

/**
 * Comunhão universal de bens: o cônjuge também é proprietário (ou quem está alugando), então entra como outra pessoa do contrato, com todos os
 * dados, e não como cônjuge anuente. A regra vale só para este regime e foi pedida pelo cliente, mas PRECISA ser validada pelo jurídico
 * (por exemplo, se vale também para a união estável e como fica nos demais regimes de comunhão).
 */
export const REGIME_UNIVERSAL = 'Comunhão universal de bens';
export const casadoEmComunhaoUniversal = (d: DadosLocador): boolean => estaCasado(d) && d.regimeBens === REGIME_UNIVERSAL;
/** Quem pode precisar de um cônjuge anuente (por prazo): as pessoas casadas, menos as da comunhão universal, cujo cônjuge entra como parte. */
export const precisaAnuente = (d: DadosLocador): boolean => estaCasado(d) && !casadoEmComunhaoUniversal(d);
/** O cônjuge anuente é necessário para esta pessoa: ela precisa de anuente e o prazo do contrato (`exigePrazo`) o exige. */
export const conjugeObrigatorioPara = (d: DadosLocador, exigePrazo: boolean): boolean => precisaAnuente(d) && exigePrazo;

export type ErrosConjuge = Partial<Record<keyof DadosConjuge, string>>;
export function validarConjuge(c?: DadosConjuge): ErrosConjuge {
  const d = c ?? { nome: '', documento: '', nacionalidade: '', profissao: '' };
  const e: ErrosConjuge = {};
  if (!d.nome.trim()) e.nome = 'Informe o nome completo do cônjuge.';
  if (!d.documento.trim()) e.documento = 'Informe o CPF do cônjuge.';
  else if (!cpfValido(d.documento)) e.documento = 'Confira o CPF: ele parece estar incompleto ou errado.';
  if (!d.nacionalidade.trim()) e.nacionalidade = 'Informe a nacionalidade do cônjuge.';
  if (!d.profissao.trim()) e.profissao = 'Informe a profissão do cônjuge.';
  return e;
}
export const conjugeCompleto = (c?: DadosConjuge): boolean => Object.keys(validarConjuge(c)).length === 0;
export const conjugeComAlgo = (c?: DadosConjuge): boolean => !!c && Object.values(c).some(v => v.trim() !== '');

/** Quantos erros do cônjuge contam para uma pessoa: tudo, se o prazo exige; senão, só se a pessoa já começou a preencher. */
export function qtdErrosConjuge(d: DadosLocador, exige: boolean): number {
  if (!precisaAnuente(d)) return 0;
  if (!conjugeObrigatorioPara(d, exige) && !conjugeComAlgo(d.conjuge)) return 0;
  return Object.keys(validarConjuge(d.conjuge)).length;
}

/** `dono`, `dono2`, `dono3`… ou `inq`, `inq2`, `inq3`… */
export type IdPessoa = string;
export interface PessoaCasada { id: IdPessoa; papel: 'locador' | 'locatario'; nome: string; dados: DadosLocador }

/** Pessoas casadas entre os proprietários e quem está alugando (a segunda pessoa só conta se foi adicionada). */
export function pessoasCasadas(locador?: ParteResp, locatario?: ParteResp): PessoaCasada[] {
  const out: PessoaCasada[] = [];
  const add = (id: IdPessoa, papel: PessoaCasada['papel'], d?: DadosLocador) => { if (d && precisaAnuente(d)) out.push({ id, papel, nome: d.nome.trim() || 'Pessoa sem nome', dados: d }); };
  add('dono', 'locador', locador?.principal);
  if (locador?.maisDeUm === true) { add('dono2', 'locador', locador.segundo); (locador.outros ?? []).forEach((d, i) => add(`dono${i + 3}`, 'locador', d)); }
  add('inq', 'locatario', locatario?.principal);
  if (locatario?.maisDeUm === true) { add('inq2', 'locatario', locatario.segundo); (locatario.outros ?? []).forEach((d, i) => add(`inq${i + 3}`, 'locatario', d)); }
  return out;
}

/** Casadas que ainda precisam dos dados do cônjuge anuente (só quando o prazo exige). */
export function anuenciasPendentes(c: Contrato | undefined, locador?: ParteResp, locatario?: ParteResp): PessoaCasada[] {
  if (!exigeAnuencia(c)) return [];
  return pessoasCasadas(locador, locatario).filter(p => !conjugeCompleto(p.dados.conjuge));
}

/** Cônjuges anuentes já informados, para o resumo: tanto os exigidos pelo prazo quanto os que a pessoa quis informar antes. */
export function conjugesAnuentes(_c: Contrato | undefined, locador?: ParteResp, locatario?: ParteResp): Array<PessoaCasada & { conjuge: DadosConjuge }> {
  return pessoasCasadas(locador, locatario).flatMap(p => (p.dados.conjuge && p.dados.conjuge.nome.trim() ? [{ ...p, conjuge: p.dados.conjuge }] : []));
}

/** "proprietário", "2º proprietário", "3º proprietário"… (ou quem está alugando). */
export function papelPorExtenso(id: IdPessoa): string {
  const n = Number(id.replace(/D/g, '')) || 1;
  const dono = id.startsWith('dono');
  if (n === 1) return dono ? 'proprietário' : 'quem está alugando';
  return dono ? `${n}º proprietário` : `${n}ª pessoa alugando`;
}

/** Devolve a parte com o cônjuge anuente da pessoa `id` (`dono`, `dono2`, `dono3`…) preenchido. */
export function comConjuge(parte: ParteResp | undefined, id: IdPessoa, conjuge: DadosConjuge): ParteResp | undefined {
  if (!parte) return parte;
  const n = Number(id.replace(/\D/g, '')) || 1;
  const poe = (d: DadosLocador): DadosLocador => ({ ...d, conjuge });
  if (n === 1) return { ...parte, principal: poe(parte.principal) };
  if (n === 2) return { ...parte, segundo: poe(parte.segundo) };
  return { ...parte, outros: (parte.outros ?? []).map((d, i) => (i === n - 3 ? poe(d) : d)) };
}

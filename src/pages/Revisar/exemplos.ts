import { CONDOMINIO_EXEMPLO, CONTRATO_COMPLETO, IMOVEL_EXEMPLO } from '../PaginasContrato/exemplos';
import { DUAS_PESSOAS, IMOBILIARIA, PESSOA, UMA_PESSOA } from '../PessoasEnvolvidas/exemplos';
import { LOCADOR_VAZIO, type Respostas } from '../fluxo/respostas';

/** Um preenchimento completo (para as stories das telas de revisão, compartilhamento e retomada). */
export const RESPOSTAS_COMPLETAS: Respostas = {
  uso: 'residencial',
  imovel: 'apartamento-condominio',
  usoAoPreencherLocador: 'residencial',
  locador: DUAS_PESSOAS,
  locatario: { principal: { ...PESSOA, nome: 'Pedro Alves Costa', documento: '390.533.447-05' }, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null },
  administracao: 'imobiliaria',
  imobiliaria: IMOBILIARIA,
  contrato: CONTRATO_COMPLETO,
};

/** Um preenchimento pela metade. */
export const RESPOSTAS_FALTANDO: Respostas = {
  uso: 'residencial',
  imovel: 'apartamento-condominio',
  usoAoPreencherLocador: 'residencial',
  locador: UMA_PESSOA,
  administracao: 'proprio',
  contrato: { ...IMOVEL_EXEMPLO, 'va-aluguel': 'R$ 2.500,00', 'va-prazo': '30' },
};

/** Prazo de 10 anos: cada pessoa casada tem o cônjuge anuente informado (aparece junto das pessoas na revisão). */
const CONJUGE_2 = { nome: 'Helena Costa', documento: '529.982.247-25', nacionalidade: 'Brasileira', profissao: 'Advogada' };
export const RESPOSTAS_PRAZO_LONGO: Respostas = {
  ...RESPOSTAS_COMPLETAS,
  locador: { ...DUAS_PESSOAS, principal: { ...DUAS_PESSOAS.principal, conjuge: { nome: 'Pedro Lima', documento: '168.995.350-09', nacionalidade: 'Brasileiro', profissao: 'Contador' } }, segundo: { ...DUAS_PESSOAS.segundo, conjuge: { ...CONJUGE_2, nome: 'Clara Souza' } } },
  locatario: { principal: { ...PESSOA, nome: 'Pedro Alves Costa', documento: '390.533.447-05', conjuge: CONJUGE_2 }, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null },
  contrato: { ...CONTRATO_COMPLETO, 'va-prazo': '120' },
};

/** Casa fora de condomínio: sem as perguntas e os pontos de cláusulas que só existem para condomínio. */
export const RESPOSTAS_SEM_CONDOMINIO: Respostas = {
  ...RESPOSTAS_COMPLETAS,
  imovel: 'casa-fora',
  contrato: Object.fromEntries(Object.entries(CONTRATO_COMPLETO).filter(([id]) => !(id in CONDOMINIO_EXEMPLO))),
};

/** A pessoa trocou o imóvel para um em condomínio na página 1: as perguntas do condomínio, que não existiam, ficam pendentes. */
export const RESPOSTAS_CONDOMINIO_PENDENTE: Respostas = {
  ...RESPOSTAS_SEM_CONDOMINIO,
  imovel: 'casa-condominio',
};

/** Duas páginas com algo faltando: as perguntas do condomínio (3 respostas) e uma de "Usar e conviver" (1 resposta). */
export const RESPOSTAS_DUAS_PENDENCIAS: Respostas = {
  ...RESPOSTAS_CONDOMINIO_PENDENTE,
  contrato: Object.fromEntries(Object.entries(RESPOSTAS_CONDOMINIO_PENDENTE.contrato ?? {}).filter(([id]) => id !== 'co-sublocar')),
};

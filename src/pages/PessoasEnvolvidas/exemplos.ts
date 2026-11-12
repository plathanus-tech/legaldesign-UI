import { LOCADOR_VAZIO, type DadosLocador, type ParteResp } from '../fluxo/respostas';

/** Dados fictícios para as stories (CPF e CNPJ de exemplo, válidos só no formato). */
export const PESSOA: DadosLocador = {
  ...LOCADOR_VAZIO, tipo: 'pessoa', nome: 'Maria Souza Lima', documento: '529.982.247-25', nacionalidade: 'Brasileira', profissao: 'Professora',
  estadoCivil: 'Casado(a)', regimeBens: 'Separação de bens', cep: '01310-100', logradouro: 'Avenida Paulista', numero: '1000',
  complemento: 'Sala 12', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
};
export const PESSOA_2: DadosLocador = { ...PESSOA, nome: 'João Souza Lima', documento: '168.995.350-09', profissao: 'Engenheiro', complemento: '' };
export const EMPRESA: DadosLocador = {
  ...LOCADOR_VAZIO, tipo: 'empresa', nome: 'Holding Exemplo Ltda.', documento: '11.222.333/0001-81', representante: 'Ana Pereira',
  cep: '30140-071', logradouro: 'Rua dos Aimorés', numero: '500', bairro: 'Boa Viagem', cidade: 'Belo Horizonte', uf: 'MG',
};
/** Imobiliária: CNPJ, CRECI e o representante legal que assina por ela. */
export const IMOBILIARIA: DadosLocador = {
  ...EMPRESA, tipo: 'pessoa', nome: 'Imobiliária Exemplo Ltda.', documento: '45.723.174/0001-10', creci: '12345-J', representante: 'Ana Pereira', representanteCpf: '168.995.350-09',
};
/** Corretor autônomo: CPF e CRECI dele, sem representante. */
export const CORRETOR_AUTONOMO: DadosLocador = { ...EMPRESA, tipo: 'pessoa', nome: 'Carlos Dias', documento: '529.982.247-25', creci: '123456-F' };

/** Cônjuge de exemplo (anuente), para as stories do prazo de 10 anos ou mais. */
export const CONJUGE_EXEMPLO = { nome: 'Pedro Lima', documento: '168.995.350-09', nacionalidade: 'Brasileiro', profissao: 'Contador' };
export const PESSOA_COM_CONJUGE: DadosLocador = { ...PESSOA, conjuge: CONJUGE_EXEMPLO };
/** Casados em comunhão universal de bens: o cônjuge também é proprietário (ou inquilino) e entra como outra pessoa do contrato. */
export const PESSOA_UNIVERSAL: DadosLocador = { ...PESSOA, regimeBens: 'Comunhão universal de bens' };
export const CONJUGE_UNIVERSAL: DadosLocador = { ...PESSOA_2, regimeBens: 'Comunhão universal de bens', complemento: PESSOA.complemento };

export const UMA_PESSOA: ParteResp = { principal: PESSOA, segundo: LOCADOR_VAZIO, maisDeUm: false, compartilhado: null };
export const DUAS_PESSOAS: ParteResp = { principal: PESSOA, segundo: PESSOA_2, maisDeUm: true, compartilhado: true };

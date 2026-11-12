import type { Contrato } from '../fluxo/respostas';

/** Respostas de exemplo das páginas 5 a 9, para as stories mostrarem as telas preenchidas. */
export const IMOVEL_EXEMPLO: Contrato = {
  'im-cep': '01310-100', 'im-logradouro': 'Avenida Paulista', 'im-numero': '1000', 'im-complemento': 'Apto 52', 'im-bairro': 'Bela Vista', 'im-cidade': 'São Paulo', 'im-uf': 'SP',
  'im-matricula': '12.345', 'im-mobiliado': 'nao', 'im-garagem': 'sim',
};

export const VALORES_EXEMPLO: Contrato = {
  'va-aluguel': 'R$ 2.500,00', 'va-inicio': '2026-12-01', 'va-prazo': '30', 'va-vencimento': '5',
  'va-forma': 'pix', 'va-reajuste': 'igpm',
  'va-juros': 'sim', 'va-juros-valor': '1', 'va-multa': 'sim', 'va-multa-valor': '2', 'va-correcao': 'igpm',
};

/** Perguntas que só existem para imóvel em condomínio. */
export const CONDOMINIO_EXEMPLO: Contrato = {
  'va-cond-valor': 'R$ 650,00',
  'va-cond-juros': 'sim', 'va-cond-juros-valor': '1', 'va-cond-multa': 'nao',
};

export const CONVIVENCIA_EXEMPLO: Contrato = {
  'co-sublocar': 'nao', 'co-vistoria': 'sim', 'co-vistoria-prazo': '5',
  'co-util-locatario': 'agua,luz,internet', 'co-util-restituir': 'gas',
};

export const REPAROS_EXEMPLO: Contrato = { 're-obras': 'autorizacao', 're-saida': 'ficam', 're-benf-necessarias': 'sim', 're-benf-uteis': 'sim', 're-benf-voluptuarias': 'nao' };

export const SAIDA_EXEMPLO: Contrato = { 'sa-garantia': 'caucao', 'sa-caucao': '3', 'sa-multa': 'proporcional', 'sa-multa-valor': '3', 'sa-desoneracao': 'mes12', 'sa-aviso': '30', 'sa-vistoria': 'sim' };

/** Tudo das páginas 5 a 9 (imóvel em condomínio). Um dos pontos de cláusulas padrão já personalizado, como exemplo. */
export const CONTRATO_COMPLETO: Contrato = {
  ...IMOVEL_EXEMPLO, ...VALORES_EXEMPLO, ...CONDOMINIO_EXEMPLO, ...CONVIVENCIA_EXEMPLO, ...REPAROS_EXEMPLO, ...SAIDA_EXEMPLO,
  'pm-visitas': 'urgencia',
  'pm-danos': 'outro',
  'pm-danos-texto': 'Quem está alugando responde pelos danos que causar, exceto os de chuva forte ou de problemas do prédio.',
};

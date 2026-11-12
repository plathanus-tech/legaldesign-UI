/**
 * As etapas principais do fluxo e as páginas de cada uma. É daqui que os dois steppers (o geral e o das páginas da etapa)
 * tiram os nomes e as quantidades. Só descreve o que existe: não define a ordem nem as condições de exibição das páginas,
 * que continuam nas próprias telas.
 *
 * Nomes curtos, em linguagem simples. Uma etapa com uma só página não mostra o stepper interno.
 */
export interface EtapaDoFluxo {
  /** Nome curto da etapa, usado no stepper geral. */
  nome: string;
  /** Nome curto de cada página da etapa, na ordem. */
  paginas: string[];
}

export const ETAPAS_DO_FLUXO: readonly EtapaDoFluxo[] = [
  { nome: 'Preencher', paginas: ['Imóvel', 'Proprietário', 'Quem vai alugar', 'Administração', 'Endereço', 'Valores', 'Convivência', 'Mudanças', 'Saída'] },
  { nome: 'Revisar', paginas: ['Resumo'] },
  { nome: 'Estilo e pagamento', paginas: ['Estilo', 'Pagamento'] },
  { nome: 'Baixar PDF', paginas: ['Contrato'] },
];

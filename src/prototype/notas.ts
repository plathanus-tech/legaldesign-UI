/**
 * Notas para desenvolvimento do Navegador de Protótipo.
 *
 * Servem só para quem está construindo o produto: NUNCA fazem parte da interface nem do conteúdo das telas. Ficam aqui, fora
 * do código das telas, e o Navegador de Protótipo as mostra (ou esconde) por cima da tela aberta, sem mexer nas stories.
 *
 * Para cadastrar uma nota nova, basta acrescentar um item em `notasDev`. Não é preciso alterar mais nada:
 * - `id`: nome único da nota.
 * - `titulo` e `texto`: o que aparece quando alguém clica no marcador.
 * - `locais`: onde ela aparece. Cada local diz em quais telas (`telas`, por início do id da story, ex.: `telas-1-2-` vale para todas
 *   as variantes da tela 1.2) e em qual ponto da tela fica o marcador (`alvo`, opcional).
 *   O `alvo` procura um elemento da tela por `seletor` CSS, pode filtrar pelo `texto` que ele contém e pode subir até um
 *   `ancestral` (outro seletor). Se o alvo não existir na variante aberta, o marcador fica fixo no canto da tela.
 */
export interface AlvoDaNota {
  /** Seletor CSS do elemento (ex.: `h2`, `[data-foco="va-prazo"]`). */
  seletor: string;
  /** Só vale o elemento cujo texto contém isto. */
  texto?: string;
  /** Sobe do elemento achado até o ancestral que casa com este seletor. */
  ancestral?: string;
}

export interface LocalDaNota {
  /** Começos de id de story (ver /index.json do Storybook). */
  telas: string[];
  alvo?: AlvoDaNota;
  /** Só mostra o marcador se o `alvo` existir na tela aberta (sem ele, o marcador ficaria fixo no canto). Útil para notas que valem só para um estado da tela. */
  somenteComAlvo?: boolean;
}

export interface NotaDev {
  id: string;
  titulo: string;
  texto: string;
  locais: LocalDaNota[];
}

export const notasDev: NotaDev[] = [
  {
    id: 'anuencia-conjugal',
    titulo: 'Anuência conjugal',
    texto:
      'Conectar o estado civil informado em Pessoas envolvidas ao prazo do contrato. Se a pessoa for casada e o prazo for igual ou superior a 120 meses, verificar se os dados do cônjuge já foram preenchidos. Caso não tenham sido, direcionar o usuário para completar o cadastro, preservando as informações já preenchidas. O cônjuge deverá ser identificado no documento como anuente, com assinatura própria. Validar campos e regras com o jurídico.',
    locais: [
      // Pessoas envolvidas (proprietário e inquilino): o aviso fica abaixo do estado civil, dentro dos dados da pessoa
      { telas: ['telas-1-2-', 'telas-1-4-'], alvo: { seletor: 'h2', texto: 'Dados do' } },
      // etapa do prazo do contrato
      { telas: ['telas-1-6-'], alvo: { seletor: '[data-foco="va-prazo"]' } },
    ],
  },
  {
    id: 'retencao-envio-pdf',
    titulo: 'Por quanto tempo guardar nome e contato do envio do PDF',
    texto:
      'Quando a pessoa envia o PDF por e-mail ou WhatsApp depois de pagar, guardamos o nome e o contato usados no envio por mais tempo do que os 15 dias do resumo. O prazo exato ainda não foi definido: o texto da tela e o FAQ dizem só "por mais tempo". Definir o prazo com o cliente e validar com o jurídico e o DPO, e atualizar os dois textos. O PDF nunca é guardado.',
    locais: [
      { telas: ['telas-5-2-'], alvo: { seletor: 'p', texto: 'Guardamos o seu nome' } },
    ],
  },
  {
    id: 'intermediacao-corretor',
    titulo: 'Corretor ou imobiliária no documento',
    texto:
      'O responsável pela intermediação tem um cadastro único, sem escolher o tipo: nome, CPF ou CNPJ e CRECI (opcional). O tipo vem do documento digitado: com CNPJ (imobiliária), o formulário pede também o nome do representante legal e, de forma opcional, o CPF dele. Corretor autônomo preenche só nome, CPF e, se quiser, o CRECI. No documento, quem intermedia aparece com esses dados e, sendo imobiliária, assina pelo representante legal. Confirmar com o jurídico quais dados cada um precisa ter, se o CPF do representante é obrigatório e como identificar um corretor vinculado a uma imobiliária. O endereço é um só e não mudou.',
    locais: [
      { telas: ['telas-1-3-'], alvo: { seletor: 'h2', texto: 'Dados do corretor' } },
    ],
  },
  {
    id: 'condominio-condicional',
    titulo: 'Condomínio só para imóvel em condomínio',
    texto:
      'Tudo o que se refere a condomínio só deve aparecer quando o imóvel é em condomínio (casa em condomínio ou apartamento em condomínio, escolhido na primeira página). Isso vale para a taxa do condomínio e para juros e multa no atraso dele (página de valores), e para as cláusulas padrão do condomínio na revisão: despesas ordinárias, despesas extraordinárias, multas e serviços disponibilizados pelo condomínio. Em imóvel fora de condomínio, nada disso aparece no formulário, no resumo nem no documento. Se o tipo do imóvel mudar depois do preenchimento, esconder o que for de condomínio e não levá-lo para o documento.',
    locais: [
      // onde o tipo do imóvel é escolhido
      { telas: ['telas-1-1-'], alvo: { seletor: 'legend', texto: 'Como é o imóvel' } },
      // página de valores: o bloco "Condomínio" só existe para imóvel em condomínio
      { telas: ['telas-1-6-'], alvo: { seletor: 'h2', texto: 'Condomínio' }, somenteComAlvo: true },
      // revisão: o grupo "Condomínio" das cláusulas padrão
      { telas: ['telas-2-1-'] },
    ],
  },
  {
    id: 'ilustracao-interface',
    titulo: 'Ilustração da interface',
    texto:
      'Criar uma ilustração própria para o projeto, seguindo a identidade visual e os componentes da interface. A ilustração deve contribuir para a experiência de Legal Design, evitando imagens genéricas ou mockups sem relação com o produto. Não utilizar cláusulas ou conteúdos reais do contrato que possam revelar informações antes do pagamento.',
    locais: [
      // tela de apresentação: é onde a ilustração está prevista
      { telas: ['telas-0-'], alvo: { seletor: '[aria-label^="Exemplo: um contrato comum"]' } },
    ],
  },
];

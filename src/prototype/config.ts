/**
 * Config do Navegador de Protótipo (Contrato de locação · Legal Design).
 * Serve só para navegar entre as telas do protótipo; não faz parte da interface final.
 * Cada tela é uma story real do produto (Storybook). Para registrar uma tela nova:
 * crie a story e adicione um item aqui com o `storyId` dela (ver /index.json do Storybook).
 * Itens sem `storyId` aparecem como "Em breve" (mapa da arquitetura da informação).
 */
export interface ScreenNode {
  id: string;
  label: string;
  /** Id da story (ex.: `telas-0-apresentação--padrao`). Sem id = tela ainda não desenhada. */
  storyId?: string;
  variants?: Array<{ id: string; label: string; storyId: string }>;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'flow';
  screens: ScreenNode[];
}

export interface Journey {
  id: string;
  label: string;
  items: Array<ScreenNode | FlowNode>;
}

export const journeys: Journey[] = [
  {
    id: 'locacao',
    label: 'Jornada · Contrato de locação',
    items: [
      {
        id: 'tela-0',
        label: '0 - Apresentação',
        storyId: 'telas-0-apresentação--padrao',
        variants: [
          { id: 'tela-0-instagram', label: 'Navegador interno do Instagram', storyId: 'telas-0-apresentação--navegador-interno-do-instagram' },
          { id: 'tela-0-atualizacao', label: 'Com atualização jurídica informada', storyId: 'telas-0-apresentação--com-atualizacao-juridica' },
          { id: 'tela-0-sem-data', label: 'Sem data de atualização', storyId: 'telas-0-apresentação--sem-data-de-atualizacao' },        ],
      },
      {
        id: 'preencher',
        label: '1 - Preencher',
        type: 'flow',
        screens: [
          {
            id: 'tela-1-1',
            label: '1.1 Tipo de locação e de imóvel',
            storyId: 'telas-1-1-tipo-de-locação-e-de-imóvel--padrao',
            variants: [
              { id: 'tela-1-1-uso', label: 'Uso escolhido (residencial)', storyId: 'telas-1-1-tipo-de-locação-e-de-imóvel--uso-escolhido' },
              { id: 'tela-1-1-completo', label: 'Tudo escolhido (apartamento em condomínio)', storyId: 'telas-1-1-tipo-de-locação-e-de-imóvel--completo' },
              { id: 'tela-1-1-comercial', label: 'Comercial escolhido', storyId: 'telas-1-1-tipo-de-locação-e-de-imóvel--comercial' },
              { id: 'tela-1-1-mudou', label: 'Mudou o uso (índice pede revisão)', storyId: 'telas-1-1-tipo-de-locação-e-de-imóvel--mudou-para-comercial' },
            ],
          },
          {
            id: 'tela-1-2',
            label: '1.2 Dono do imóvel',
            storyId: 'telas-1-2-dono-do-imóvel--padrao',
            variants: [
              { id: 'tela-1-2-pessoa', label: 'Uma pessoa, só um proprietário', storyId: 'telas-1-2-dono-do-imóvel--uma-pessoa' },
              { id: 'tela-1-2-empresa', label: 'Uma empresa', storyId: 'telas-1-2-dono-do-imóvel--empresa' },
              { id: 'tela-1-2-mais', label: 'Mais de um proprietário', storyId: 'telas-1-2-dono-do-imóvel--mais-de-um' },
              { id: 'tela-1-2-prazo', label: 'Casado(a) com prazo de 10 anos (cônjuge necessário)', storyId: 'telas-1-2-dono-do-imóvel--prazo-longo' },
              { id: 'tela-1-2-prazo-ok', label: 'Casado(a) com prazo de 10 anos (cônjuge informado)', storyId: 'telas-1-2-dono-do-imóvel--prazo-longo-conjuge' },
              { id: 'tela-1-2-comunhao', label: 'Casado(a) em comunhão universal (cônjuge entra como outro proprietário)', storyId: 'telas-1-2-dono-do-imóvel--comunhao-universal' },
              { id: 'tela-1-2-comunhao-ok', label: 'Casado(a) em comunhão universal (cônjuge informado)', storyId: 'telas-1-2-dono-do-imóvel--comunhao-universal-conjuge' },
              { id: 'tela-1-2-erros', label: 'Com informações faltando', storyId: 'telas-1-2-dono-do-imóvel--com-erros' },
            ],
          },
          {
            id: 'tela-1-3',
            label: '1.3 Quem administra o aluguel',
            storyId: 'telas-1-3-quem-administra-o-aluguel--padrao',
            variants: [
              { id: 'tela-1-3-imob', label: 'Imobiliária (CNPJ e representante legal)', storyId: 'telas-1-3-quem-administra-o-aluguel--com-imobiliaria' },
              { id: 'tela-1-3-autonomo', label: 'Corretor autônomo (CPF)', storyId: 'telas-1-3-quem-administra-o-aluguel--corretor-autonomo' },
              { id: 'tela-1-3-proprio', label: 'O próprio proprietário', storyId: 'telas-1-3-quem-administra-o-aluguel--proprio-proprietario' },
              { id: 'tela-1-3-erros', label: 'Com informações faltando', storyId: 'telas-1-3-quem-administra-o-aluguel--com-erros' },
            ],
          },
          {
            id: 'tela-1-4',
            label: '1.4 Quem vai alugar',
            storyId: 'telas-1-4-quem-vai-alugar--padrao',
            variants: [
              { id: 'tela-1-4-um', label: 'Uma pessoa', storyId: 'telas-1-4-quem-vai-alugar--um-inquilino' },
              { id: 'tela-1-4-empresa', label: 'Uma empresa', storyId: 'telas-1-4-quem-vai-alugar--empresa' },
              { id: 'tela-1-4-mais', label: 'Mais de uma pessoa alugando', storyId: 'telas-1-4-quem-vai-alugar--mais-de-um' },
              { id: 'tela-1-4-comunhao', label: 'Casado(a) em comunhão universal (cônjuge entra como outra pessoa alugando)', storyId: 'telas-1-4-quem-vai-alugar--comunhao-universal' },
              { id: 'tela-1-4-comunhao-ok', label: 'Casado(a) em comunhão universal (cônjuge informado)', storyId: 'telas-1-4-quem-vai-alugar--comunhao-universal-conjuge' },
              { id: 'tela-1-4-erros', label: 'Com informações faltando', storyId: 'telas-1-4-quem-vai-alugar--com-erros' },
            ],
          },
          {
            id: 'tela-1-5',
            label: '1.5 Dados do imóvel',
            storyId: 'telas-1-5-dados-do-imóvel--padrao',
            variants: [
              { id: 'tela-1-5-ok', label: 'Preenchida', storyId: 'telas-1-5-dados-do-imóvel--preenchida' },
              { id: 'tela-1-5-inventario', label: 'Sim, com inventário', storyId: 'telas-1-5-dados-do-imóvel--com-inventario' },
              { id: 'tela-1-5-inventario-erros', label: 'Inventário com informações faltando', storyId: 'telas-1-5-dados-do-imóvel--inventario-com-erros' },
              { id: 'tela-1-5-erros', label: 'Com informações faltando', storyId: 'telas-1-5-dados-do-imóvel--com-erros' },
            ],
          },
          {
            id: 'tela-1-6',
            label: '1.6 Valores e pagamento',
            storyId: 'telas-1-6-valores-e-pagamento--padrao',
            variants: [
              { id: 'tela-1-6-ok', label: 'Imóvel em condomínio (com perguntas do condomínio)', storyId: 'telas-1-6-valores-e-pagamento--em-condominio' },
              { id: 'tela-1-6-fora', label: 'Imóvel fora de condomínio', storyId: 'telas-1-6-valores-e-pagamento--fora-de-condominio' },
              { id: 'tela-1-6-prazo', label: 'Prazo de 10 anos: dados do cônjuge pendentes', storyId: 'telas-1-6-valores-e-pagamento--prazo-longo-pendente' },
              { id: 'tela-1-6-prazo-ok', label: 'Prazo de 10 anos: cônjuge já informado', storyId: 'telas-1-6-valores-e-pagamento--prazo-longo-completo' },
              { id: 'tela-1-6-erros', label: 'Com informações faltando', storyId: 'telas-1-6-valores-e-pagamento--com-erros' },
            ],
          },
          {
            id: 'tela-1-7',
            label: '1.7 Usar e conviver',
            storyId: 'telas-1-7-usar-e-conviver--padrao',
            variants: [
              { id: 'tela-1-7-ok', label: 'Preenchida', storyId: 'telas-1-7-usar-e-conviver--preenchida' },
              { id: 'tela-1-7-erros', label: 'Com informações faltando', storyId: 'telas-1-7-usar-e-conviver--com-erros' },
            ],
          },
          {
            id: 'tela-1-8',
            label: '1.8 Mudanças e benfeitorias',
            storyId: 'telas-1-8-reparos-obras-e-benfeitorias--padrao',
            variants: [
              { id: 'tela-1-8-ok', label: 'Preenchida (mudanças com autorização)', storyId: 'telas-1-8-reparos-obras-e-benfeitorias--preenchida' },
              { id: 'tela-1-8-sem', label: 'Mudanças não permitidas', storyId: 'telas-1-8-reparos-obras-e-benfeitorias--sem-obras' },
              { id: 'tela-1-8-erros', label: 'Com informações faltando', storyId: 'telas-1-8-reparos-obras-e-benfeitorias--com-erros' },
            ],
          },
          {
            id: 'tela-1-9',
            label: '1.9 Saída, garantias e penalidades',
            storyId: 'telas-1-9-saída-garantias-e-penalidades--padrao',
            variants: [
              { id: 'tela-1-9-caucao', label: 'Depósito (caução)', storyId: 'telas-1-9-saída-garantias-e-penalidades--com-caucao' },
              { id: 'tela-1-9-fiador', label: 'Fiador', storyId: 'telas-1-9-saída-garantias-e-penalidades--com-fiador' },
              { id: 'tela-1-9-mes-isencao', label: 'Mês da isenção maior que o contrato', storyId: 'telas-1-9-saída-garantias-e-penalidades--mes-da-isencao-maior-que-o-contrato' },
              { id: 'tela-1-9-erros', label: 'Com informações faltando', storyId: 'telas-1-9-saída-garantias-e-penalidades--com-erros' },
            ],
          },
        ],
      },
      {
        id: 'revisar',
        label: '2 - Revisar',
        type: 'flow',
        screens: [
          {
            id: 'tela-2-1',
            label: '2.1 Resumo do contrato',
            storyId: 'telas-2-1-resumo-do-contrato--completo',
            variants: [{ id: 'tela-2-1-compartilhar', label: 'Compartilhar o resumo (modal)', storyId: 'telas-2-1-resumo-do-contrato--compartilhando' }, { id: 'tela-2-1-sem-condominio', label: 'Sem condomínio (casa fora de condomínio)', storyId: 'telas-2-1-resumo-do-contrato--sem-condominio' }, { id: 'tela-2-1-alteracao-salva', label: 'Voltando de uma edição (alteração salva)', storyId: 'telas-2-1-resumo-do-contrato--alteracao-salva' }, { id: 'tela-2-1-alteracao-pendente', label: 'Voltando de uma edição que deixou algo pendente', storyId: 'telas-2-1-resumo-do-contrato--alteracao-com-pendencia' }, { id: 'tela-2-1-alteracao-duas-pendencias', label: 'Voltando de uma edição com duas seções pendentes', storyId: 'telas-2-1-resumo-do-contrato--alteracao-com-duas-pendencias' }, { id: 'tela-2-1-sem-anuente', label: 'Sem cônjuge anuente (prazo menor que 10 anos)', storyId: 'telas-2-1-resumo-do-contrato--sem-anuente' }],
          },
        ],
      },
      {
        id: 'escolher',
        label: '3 - Escolher e confirmar',
        type: 'flow',
        screens: [
          {
            id: 'tela-3-1',
            label: '3.1 Estilo, logo e aceites',
            storyId: 'telas-3-1-estilo-logo-e-aceites--padrao',
            variants: [
              { id: 'tela-3-1-ok', label: 'Tudo escolhido e aceito', storyId: 'telas-3-1-estilo-logo-e-aceites--preenchida' },
              { id: 'tela-3-1-erros', label: 'Com informações faltando', storyId: 'telas-3-1-estilo-logo-e-aceites--com-erros' },
            ],
          },
        ],
      },
      {
        id: 'pagar',
        label: '4 - Pagar',
        type: 'flow',
        screens: [
          {
            id: 'tela-4-1',
            label: '4.1 Pagamento (janela do gateway)',
            storyId: 'telas-4-1-pagamento--padrao',
            variants: [
              { id: 'tela-4-1-recusado', label: 'Dentro do gateway: pagamento recusado', storyId: 'telas-4-1-pagamento--recusado' },
              { id: 'tela-4-1-pix', label: 'Dentro do gateway: Pix expirado', storyId: 'telas-4-1-pagamento--pix-expirado' },
              { id: 'tela-4-1-fechou', label: 'Fechou a janela sem pagar', storyId: 'telas-4-1-pagamento--janela-fechada' },
            ],
          },
        ],
      },
      {
        id: 'baixar',
        label: '5 - Baixar PDF',
        type: 'flow',
        screens: [
          {
            id: 'tela-5-1',
            label: '5.1 Sucesso e download',
            storyId: 'telas-5-1-sucesso-e-download--padrao',
            variants: [
              { id: 'tela-5-1-gerando', label: 'Gerando o PDF', storyId: 'telas-5-1-sucesso-e-download--gerando' },
              { id: 'tela-5-1-falha', label: 'Falha ao gerar o PDF', storyId: 'telas-5-1-sucesso-e-download--falha' },
              { id: 'tela-5-1-enviado', label: 'PDF enviado', storyId: 'telas-5-1-sucesso-e-download--pdf-enviado' },
              { id: 'tela-5-1-baixou', label: 'Depois de baixar', storyId: 'telas-5-1-sucesso-e-download--baixou' },
            ],
          },
          {
            id: 'tela-5-2',
            label: '5.2 Enviar por e-mail ou WhatsApp',
            storyId: 'telas-5-2-enviar-por-e-mail-ou-whatsapp--padrao',
            variants: [
              { id: 'tela-5-2-whats', label: 'Só WhatsApp (e-mail desmarcado)', storyId: 'telas-5-2-enviar-por-e-mail-ou-whatsapp--so-whatsapp' },
              { id: 'tela-5-2-ambos', label: 'E-mail e WhatsApp', storyId: 'telas-5-2-enviar-por-e-mail-ou-whatsapp--ambos' },
              { id: 'tela-5-2-erros', label: 'Com informações faltando', storyId: 'telas-5-2-enviar-por-e-mail-ou-whatsapp--com-erros' },
            ],
          },
        ],
      },
      {
        id: 'link',
        label: 'Acesso por link',
        type: 'flow',
        screens: [
          {
            id: 'tela-a',
            label: 'A. Resumo compartilhado',
            storyId: 'telas-a-resumo-compartilhado--so-conferir',
            variants: [{ id: 'tela-a-poucos-dias', label: 'Poucos dias restantes', storyId: 'telas-a-resumo-compartilhado--poucos-dias' }],
          },
          {
            id: 'tela-b',
            label: 'B. Retomar resumo',
            storyId: 'telas-b-retomar-resumo--padrao',
            variants: [
              { id: 'tela-b-poucos-dias', label: 'Faltando 2 dias (warning)', storyId: 'telas-b-retomar-resumo--poucos-dias' },
              { id: 'tela-b-ultimo-dia', label: 'Último dia (warning)', storyId: 'telas-b-retomar-resumo--ultimo-dia' },
            ],
          },
          { id: 'tela-c', label: 'C. Link expirado', storyId: 'telas-c-link-expirado--padrao' },
        ],
      },
    ],
  },
];

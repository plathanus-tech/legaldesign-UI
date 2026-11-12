// Textos da Tela 0 (Apresentação). Rascunho para aprovação do cliente/jurídico.
// Itens entre colchetes são pendências de conteúdo: não substituir por dados inventados.

/** Data da última atualização do modelo. Preenchida pelo cliente (não inventar); `null` oculta a informação. */
export const ATUALIZADO_EM_PADRAO = '[data]';

/**
 * Fatos rápidos da plataforma, na introdução (valem para qualquer modelo). Não repetem o título nem o
 * subtítulo, que já dizem que o conteúdo é jurídico, atualizado e fácil de entender.
 */
export const FACILIDADES = [
  { id: 'sem-cadastro', titulo: 'Sem cadastro', texto: 'Comece agora. Não precisa criar conta.' },
  { id: 'pagamento', titulo: 'Pagamento facilitado', texto: 'Pix ou cartão, como for mais fácil para você. Ambiente seguro.' },
  { id: 'protegidos', titulo: 'Dados protegidos', texto: 'O documento não fica guardado com a gente. Baixe o PDF assim que terminar.' },
] as const;

export const PASSOS = [
  { titulo: 'Informe os dados', texto: 'Responda a perguntas simples sobre a locação, sem precisar conhecer termos jurídicos.' },
  { titulo: 'Confira as informações', texto: 'Revise o resumo do preenchimento e ajuste o que for necessário antes de pagar.' },
  { titulo: 'Realize o pagamento', texto: 'Pague com Pix, cartão de crédito ou débito, em ambiente seguro.' },
  { titulo: 'Receba seu documento', texto: 'Receba seu contrato em PDF, pronto para baixar.' },
] as const;

export const ESTILOS = [
  { id: 'classico', titulo: 'Clássico', texto: 'Texto corrido e visual tradicional.' },
  { id: 'visual-law', titulo: 'Visual Law', texto: 'Ícones, destaques e blocos explicativos.' },
  { id: 'minimalista', titulo: 'Minimalista', texto: 'Layout limpo, com foco na leitura.' },
] as const;

export const FAQ = [
  {
    title: 'Preciso criar uma conta?',
    content: 'Não. Você começa na hora, sem cadastro. Só pedimos seu nome e um contato se você quiser receber o PDF por e-mail ou WhatsApp.',
  },
  {
    title: 'Quanto tempo leva?',
    content: 'Na primeira vez, de 15 a 20 minutos. Leva menos se você já tiver tudo à mão e importar o arquivo com os dados do proprietário. São 9 páginas de perguntas, uma revisão e a escolha do estilo do contrato.',
  },
  {
    title: 'Posso parar e voltar depois?',
    content: 'Sim. Em “Compartilhar resumo”, copie o link para continuar editando depois. O resumo fica guardado por 15 dias, e o link vale até a data que aparece na tela. Depois disso, é apagado automaticamente. Se você não guardar o link, ao fechar a página precisará começar de novo.',
  },
  {
    title: 'O que é Legal Design?',
    content: 'É usar design e linguagem simples para que qualquer pessoa entenda o que está assinando: títulos claros, destaques e blocos que explicam cada ponto.',
  },
  {
    title: 'Posso editar o PDF depois?',
    content: 'Não. O PDF é final e não editável. Por isso, antes de pagar, você revisa um resumo com tudo o que escolheu.',
  },
  {
    title: 'Como eu pago?',
    content: 'Com Pix, cartão de crédito ou débito. O pagamento acontece no ambiente seguro do meio de pagamento, e nós não vemos nem guardamos os dados do seu cartão.',
  },
  {
    title: 'Meus dados ficam guardados?',
    // Parágrafos separados por quebra de linha. O bloco "extra" é o subtítulo, a lista e a frase final.
    content: 'O PDF do contrato não fica armazenado em nossos servidores. Você faz o download ao finalizar.\nO resumo do preenchimento fica armazenado em nosso banco de dados por 15 dias. Nesse período, você pode voltar para editar o contrato ou permitir que a pessoa que recebeu o resumo confira as informações. Após esse prazo, ele é apagado.',
    extra: {
      titulo: 'E meus dados de contato?',
      itens: [
        'Para compartilhar o resumo ou guardar o link de edição, não pedimos nem armazenamos nenhum contato: o envio sai do seu próprio WhatsApp ou e-mail.',
        'Se, após o pagamento, você enviar o PDF por e-mail ou WhatsApp, seu nome e o contato utilizados no envio também ficam armazenados em nosso banco de dados.',
      ],
      fim: 'Mesmo nesse último caso, o PDF não fica armazenado por nós.',
    },
  },
  {
    title: 'Funciona no celular?',
    content: 'Sim. Tudo funciona direto no navegador, sem instalar nada, no celular, tablet ou computador.',
  },
] as const;

/** Nome da marca, usado no texto acessível do link do Instagram. Trocar pelo nome real. */
export const NOME_DA_MARCA = 'Marca';
/** Perfil da empresa no Instagram. ENDEREÇO DE EXEMPLO: trocar pelo perfil real (ex.: https://www.instagram.com/nomedaempresa). */
export const INSTAGRAM_URL = 'https://www.instagram.com/';

import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { EnviarPdf } from './EnviarPdf';

const meta: Meta<typeof EnviarPdf> = {
  title: 'Telas/5.2 - Enviar por e-mail ou WhatsApp',
  component: EnviarPdf,
  args: {
    onSair: () => irPara(TELAS.inicio),
    onVoltar: () => irPara(TELAS.sucesso),
    onEnviado: () => irPara(TELAS.sucessoEnviado),
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Modal sobre o pagamento confirmado (5.1) para enviar o PDF por e-mail e/ou WhatsApp (pode marcar os dois), por exemplo para o proprietário ou quem está alugando. Pede o nome de quem envia e já vem com o e-mail marcado; os campos de contato só aparecem para os canais marcados. Quando o envio dá certo, volta para o pagamento confirmado (5.1) com a mensagem de sucesso. Guardamos o nome e o contato, não o PDF. Avisa que o arquivo no WhatsApp expira. O provedor de envio por WhatsApp ainda não foi definido.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof EnviarPdf>;

export const Padrao: Story = { name: 'Padrão (e-mail)' };
export const SoWhatsapp: Story = { name: 'Só WhatsApp (e-mail desmarcado)', args: { inicial: { porEmail: false, porWhatsapp: true } } };
export const Ambos: Story = { name: 'E-mail e WhatsApp', args: { inicial: { nome: 'Maria Souza', porEmail: true, porWhatsapp: true, email: 'nome@exemplo.com', whatsapp: '(11) 98765-4321' } } };
export const FalhaNoEnvio: Story = { name: 'Falha no envio', args: { falhou: true, inicial: { nome: 'Maria Souza', email: 'nome@exemplo.com' } } };
export const ComErros: Story = { name: 'Com informações faltando', args: { mostrarErros: true, inicial: { porEmail: true, porWhatsapp: true } } };

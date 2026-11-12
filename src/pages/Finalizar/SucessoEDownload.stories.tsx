import type { Meta, StoryObj } from '@storybook/react';
import { irPara, TELAS } from '../../prototype/navegar';
import { limparRespostas } from '../fluxo/respostas';
import { SucessoEDownload } from './SucessoEDownload';

const meta: Meta<typeof SucessoEDownload> = {
  title: 'Telas/5.1 - Sucesso e download',
  component: SucessoEDownload,
  args: {
    onSair: () => irPara(TELAS.inicio),
    onEnviar: () => irPara(TELAS.enviarPdf),
    onNovoContrato: () => { limparRespostas(); irPara(TELAS.tipoDeLocacao); },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Contrato gerado e download do PDF. A mensagem confirma o pagamento e que o contrato foi gerado, sem comemoração exagerada. O documento aparece como um arquivo PDF pronto (nome, formato e "pronto para baixar"). As ações do documento ficam juntas no cartão, em ordem de peso: "Baixar contrato em PDF" (principal) e "Enviar contrato" (secundária, que leva direto à tela com e-mail e WhatsApp, com o e-mail já marcado). "Criar novo contrato" fica separado, com menos destaque. Não há link para baixar de novo, e o subtítulo avisa isso. Antes do PDF ficar pronto há dois estados: "Gerando o PDF" (indicador de espera, pede para deixar a página aberta) e "Falha ao gerar o PDF" (o pagamento continua confirmado; há "Tentar de novo" e "Recarregar a página"). Dependências: o download e o envio são simulados no protótipo, e o provedor de envio por WhatsApp ainda não foi definido.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SucessoEDownload>;

export const Gerando: Story = { name: 'Gerando o PDF', args: { geracao: 'gerando' } };
export const Falha: Story = { name: 'Falha ao gerar o PDF', args: { geracao: 'falha' } };
export const Padrao: Story = { name: 'Padrão' };
export const PdfEnviado: Story = { name: 'PDF enviado', args: { enviadoPor: { email: true } } };
export const Baixou: Story = { name: 'Depois de baixar', args: { baixou: true } };

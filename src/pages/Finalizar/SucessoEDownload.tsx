import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Info, RefreshCw, Send } from 'lucide-react';
import { Badge, Button, Feedback, Spinner } from '../../index';
import { cx } from '../../utils/cx';
import { AvisoFlutuante, type AvisoFlutuanteDados } from '../fluxo/AvisoFlutuante';
import { FluxoShell } from '../fluxo/FluxoShell';
import styles from '../fluxo/PaginaEtapa.module.css';
import estilos from './Finalizar.module.css';

/** Nome do arquivo mostrado no cartão do documento. */
const NOME_DO_ARQUIVO = 'Contrato de locação de imóvel.pdf';

/** Etapas da geração do PDF depois do pagamento. */
export type GeracaoDoPdf = 'gerando' | 'falha' | 'pronto';

export interface SucessoEDownloadProps {
  /** Em que ponto está a geração do PDF. Padrão: pronto. */
  geracao?: GeracaoDoPdf;
  /** Recarrega a página (padrão: recarrega o navegador). O contrato continua guardado neste navegador. */
  onRecarregar?: () => void;
  /** O PDF acabou de ser enviado pela tela 5.2 (volta para cá com a mensagem de sucesso). */
  enviadoPor?: { email?: boolean; whatsapp?: boolean };
  /** Já mostra o aviso de que o PDF foi baixado (para as stories). */
  baixou?: boolean;
  onSair?: () => void;
  /** Abre a tela de enviar o PDF, onde a pessoa escolhe e-mail, WhatsApp ou os dois. */
  onEnviar?: () => void;
  /** Começa outro contrato. */
  onNovoContrato?: () => void;
}

/**
 * Tela 5.1: contrato gerado e download do PDF. A mensagem confirma o pagamento e que o contrato foi gerado, sem festa. O
 * documento aparece como um arquivo PDF pronto, e as ações do documento atual ficam juntas, em ordem de peso: baixar (principal),
 * enviar (secundária, leva direto à tela onde se escolhe e-mail, WhatsApp ou os dois) e, separada, criar um novo contrato (terciária). O download é direto, nesta
 * tela: não há link para baixar de novo, e o subtítulo avisa isso (sem caixa de alerta, para a tela não parecer um erro). A
 * primeira folha do PDF é o resumo executivo, dito numa linha do cartão do documento.
 * Dependências: o download e o envio ainda são simulados no protótipo, e o provedor de envio por WhatsApp não foi definido.
 */
export function SucessoEDownload({ geracao = 'pronto', enviadoPor, baixou = false, onSair, onEnviar, onNovoContrato, onRecarregar = () => window.location.reload() }: SucessoEDownloadProps) {
  const [estado, setEstado] = useState<GeracaoDoPdf>(geracao);
  // "PDF baixado": aviso flutuante, centralizado no alto, que some sozinho depois de um tempo
  const AVISO_BAIXADO = { title: 'PDF baixado', message: 'Procure o arquivo na pasta de downloads do seu aparelho.' };
  // voltando da tela de envio, o aviso de "PDF enviado" aparece do mesmo jeito
  const [aviso, setAviso] = useState<AvisoFlutuanteDados | null>(() => enviadoPor
    ? { id: 1, title: 'PDF enviado', message: `Enviamos o contrato por ${[enviadoPor.email && 'e-mail', enviadoPor.whatsapp && 'WhatsApp'].filter(Boolean).join(' e ')}.` }
    : baixou ? { id: 1, ...AVISO_BAIXADO } : null);
  // enquanto o PDF é baixado, o botão mostra um indicador de carregamento (no protótipo, a espera é simulada)
  const [baixando, setBaixando] = useState(false);
  const espera = useRef<number>();
  useEffect(() => () => window.clearTimeout(espera.current), []);
  const baixar = () => {
    setBaixando(true);
    espera.current = window.setTimeout(() => { setBaixando(false); setAviso({ id: Date.now(), ...AVISO_BAIXADO }); }, 1500);
  };

  // Simulação do protótipo: "Tentar novamente" volta a gerar e, depois de alguns segundos, o PDF fica pronto
  const tentarDeNovo = () => setEstado('gerando');
  useEffect(() => {
    if (estado !== 'gerando' || geracao === 'gerando') return;
    const espera = window.setTimeout(() => setEstado('pronto'), 2500);
    return () => window.clearTimeout(espera);
  }, [estado, geracao]);

  if (estado !== 'pronto') {
    const gerando = estado === 'gerando';
    return (
      <FluxoShell modelo="Contrato de locação de imóvel" etapa={3} resumo={[]} resumoLateral={false} onSair={onSair} avisarAoSair={false}>
        <div className={cx(styles.pagina, estilos.sucesso)}>
          <header className={cx(styles.centro, estilos.sucessoTopo)}>
            <Badge status="success" dot>Pagamento confirmado</Badge>
            <h1 className={styles.h1}>{gerando ? 'Estamos gerando o seu contrato' : 'Não conseguimos gerar o PDF'}</h1>
            <p className={styles.lead}>
              {gerando
                ? 'Isso leva alguns segundos. Deixe esta página aberta até o PDF ficar pronto.'
                : 'Seu pagamento foi confirmado. Você não precisa pagar novamente para tentar gerar o contrato.'}
            </p>
          </header>

          <section className={estilos.documento} aria-label="Geração do contrato">
            {gerando ? (
              <div className={estilos.gerando}>
                <Spinner size="lg" label="Gerando o PDF do contrato" />
                <p className={estilos.gerandoTexto}>Montando o seu contrato…</p>
              </div>
            ) : (
              <>
                <Feedback type="error" title="Algo deu errado ao gerar o PDF" message="Isso não é culpa sua. Suas respostas continuam salvas. Tente gerar o PDF novamente. Se o problema continuar, recarregue a página e tente mais uma vez." />
                <div className={estilos.acoesDoc}>
                  <Button iconLeft={<RefreshCw size={20} />} onClick={tentarDeNovo}>Tentar novamente</Button>
                  <Button variant="outline" onClick={onRecarregar}>Recarregar página</Button>
                </div>
              </>
            )}
          </section>
        </div>
      </FluxoShell>
    );
  }

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={3} resumo={[]} resumoLateral={false} onSair={onSair} avisarAoSair={false}>
      <AvisoFlutuante aviso={aviso} />
      <div className={cx(styles.pagina, estilos.sucesso)}>
        <header className={cx(styles.centro, estilos.sucessoTopo)}>
          <h1 className={styles.h1}>Seu contrato está pronto!</h1>
          <p className={styles.lead}>O pagamento foi confirmado e seu contrato de locação foi gerado.</p>
        </header>

        <section className={estilos.documento} aria-label="Seu contrato">
          <div className={estilos.arquivo}>
            <span className={estilos.pdfIcone} aria-hidden="true">
              <FileText size={24} />
              <span className={estilos.pdfRotulo}>PDF</span>
            </span>
            <div className={estilos.arquivoTexto}>
              <p className={estilos.arquivoNome}>{NOME_DO_ARQUIVO}</p>
              <p className={estilos.arquivoMeta}>PDF · Não editável</p>
            </div>
          </div>

          <p className={estilos.arquivoResumo}>A primeira página contém o resumo executivo do contrato.</p>

          <div className={estilos.acoesDoc}>
            <Button iconLeft={baixando ? <Spinner size="sm" label="Baixando o PDF" /> : <Download size={20} />} disabled={baixando} onClick={baixar}>{baixando ? 'Baixando…' : 'Baixar contrato em PDF'}</Button>
            <Button variant="outline" iconLeft={<Send size={20} />} onClick={() => onEnviar?.()}>Enviar contrato</Button>
          </div>

        </section>

        {/* o aviso de guarda fica fora do cartão, em tom informativo (não é um erro) */}
        <div className={estilos.guarde}>
          <Info size={16} className={estilos.guardeIcone} aria-hidden="true" />
          <div>
            <p className={estilos.infoTitulo}>Guarde seu contrato com cuidado</p>
            <p className={estilos.infoTexto}>Não armazenamos o documento nem disponibilizamos um novo link para download. Depois de sair desta página, não será possível baixá-lo novamente.</p>
          </div>
        </div>

        <div className={estilos.novo}>
          <p className={estilos.novoTexto}>Precisa de outro contrato?</p>
          <Button variant="ghost" onClick={onNovoContrato}>Criar novo contrato</Button>
        </div>
      </div>
    </FluxoShell>
  );
}

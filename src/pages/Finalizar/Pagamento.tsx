import { useEffect, useRef, useState } from 'react';
import { Copy, CreditCard, Landmark, QrCode, ShieldCheck } from 'lucide-react';
import { Button, Dialog, Feedback, Spinner } from '../../index';
import { FluxoShell } from '../fluxo/FluxoShell';
import { GrupoOpcoes, OpcaoCard } from '../fluxo/OpcaoCard';
import styles from '../fluxo/PaginaEtapa.module.css';
import { lerRespostas } from '../fluxo/respostas';
import estilos from './Finalizar.module.css';
import { estiloPorId, precoDoEstilo } from './estilos';

type Forma = 'pix' | 'credito' | 'debito';
/** Estados que acontecem DENTRO da janela do gateway. */
export type EstadoGateway = 'escolha' | 'processando' | 'recusado' | 'pix-expirado';


export interface PagamentoProps {
  /** Abre a janela do gateway assim que a tela aparece (é o que acontece depois de escolher o estilo). Padrão: sim. */
  abrirAoEntrar?: boolean;
  /** Estado inicial dentro da janela do gateway (para as stories mostrarem recusa e Pix expirado). */
  estado?: EstadoGateway;
  /** A pessoa já fechou a janela sem pagar (para a story mostrar a tela por trás). */
  fechou?: boolean;
  onSair?: () => void;
  /** Volta ao estilo e aceites. */
  onVoltar?: () => void;
  /** Pagamento aprovado: a janela fecha e a pessoa volta para o fluxo da marca. */
  onPago?: () => void;
}

/**
 * Tela 4.1: pagamento. Depois de escolher o estilo, a janela do serviço de pagamento (gateway) abre sobre esta tela, embutida,
 * e é lá que a pessoa escolhe Pix, cartão de crédito ou débito, informa os dados que o gateway pedir (inclusive CPF, se ele
 * exigir), e onde acontecem as recusas, o Pix que expira e as novas tentativas, sem sair da tela. Quando o pagamento é
 * aprovado, a janela fecha e a pessoa volta ao fluxo (5.1). Se fechar a janela, esta tela continua com o pedido e o botão para
 * abrir de novo. A janela aqui é uma simulação: o visual real é do gateway. O valor e os dados pedidos ainda precisam ser
 * confirmados com o cliente.
 */
export function Pagamento({ abrirAoEntrar = true, estado = 'escolha', fechou = false, onSair, onVoltar, onPago }: PagamentoProps) {
  const estilo = lerRespostas().contrato?.['fi-estilo'] ?? '';
  // cada estilo tem o seu valor: o pagamento mostra o do estilo escolhido
  const VALOR = precoDoEstilo(estilo);
  const [aberta, setAberta] = useState(abrirAoEntrar && !fechou);
  const [cancelou, setCancelou] = useState(fechou);
  const [forma, setForma] = useState<Forma>(estado === 'pix-expirado' ? 'pix' : 'pix');
  const [etapa, setEtapa] = useState<EstadoGateway>(estado);
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const abrir = () => { setEtapa('escolha'); setCancelou(false); setAberta(true); };
  // fechar a janela volta para esta tela, que explica que o pagamento não foi concluído (sem abrir outra janela)
  const fechar = () => { setAberta(false); setCancelou(true); };
  const confirmar = () => {
    setEtapa('processando');
    timer.current = setTimeout(() => { setAberta(false); onPago?.(); }, 1500);
  };

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={2} pagina={{ atual: 2 }} resumo={[]} resumoLateral={false} onSair={onSair}>
      <div className={styles.pagina}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Pagamento</h1>
          <p className={styles.lead}>Falta pouco! Faça o pagamento para baixar seu contrato em PDF.</p>
          <p className={estilos.nota}>Após o pagamento, o PDF não poderá ser alterado.</p>
        </header>

        <section className={estilos.pedido} aria-label="Seu pedido">
          <div className={estilos.pedidoLinha}>
            <div>
              <p className={estilos.pedidoNome}>Contrato de locação de imóvel</p>
              <p className={estilos.pedidoDesc}>{estiloPorId(estilo) ? `Estilo ${estiloPorId(estilo)?.titulo} · ` : ''}PDF não editável</p>
            </div>
            <p className={estilos.preco} aria-label={`Valor: ${VALOR}`}>{VALOR}</p>
          </div>
        </section>

        <dl className={estilos.infos}>
          <div className={estilos.info}>
            <dt className={estilos.infoTitulo}>Formas de pagamento</dt>
            <dd className={estilos.infoTexto}>Você pode pagar com Pix, cartão de crédito ou cartão de débito.</dd>
          </div>
          <div className={estilos.info}>
            <dt className={estilos.infoTitulo}>Segurança</dt>
            <dd className={estilos.infoTexto}>O pagamento é processado em um ambiente seguro. O serviço poderá solicitar informações adicionais, como CPF e e-mail. Esses dados são informados diretamente ao serviço de pagamento.</dd>
          </div>
        </dl>

        {/* Só depois de fechar a janela sem pagar: perto do botão, em tom informativo (fechar a janela não é um erro) */}
        {cancelou && (
          <Feedback type="info" title="Pagamento não concluído" message="Você fechou a janela de pagamento antes de concluir a operação. Para continuar, abra novamente a janela de pagamento nesta página." />
        )}

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={onVoltar}>Voltar</Button>
          <Button iconLeft={<ShieldCheck size={20} />} onClick={abrir}>Pagar {VALOR}</Button>
        </div>
      </div>

      {/* Janela do gateway (simulada): tudo aqui dentro é do serviço de pagamento, inclusive recusas e novas tentativas */}
      <Dialog
        open={aberta}
        onClose={() => etapa !== 'processando' && fechar()}
        title="Pagamento seguro"
        subtitle="Esta janela é do serviço de pagamento. Os dados que ele pedir, como os do cartão, são informados só aqui."
        size="md"
        actions={
          etapa === 'processando' ? undefined : (
            <>
              <Button variant="secondary" onClick={fechar}>Cancelar</Button>
              <Button onClick={confirmar}>{etapa === 'recusado' || etapa === 'pix-expirado' ? 'Tentar de novo' : `Pagar ${VALOR}`}</Button>
            </>
          )
        }
      >
        {etapa === 'processando' ? (
          <div className={estilos.processando}><Spinner size="md" label="Confirmando o pagamento" /> <span>Confirmando o pagamento…</span></div>
        ) : (
          <div className={estilos.gateway}>
            {etapa === 'recusado' && <Feedback type="error" title="O pagamento não foi aprovado" message="Você pode tentar de novo ou escolher outra forma de pagamento." />}
            {etapa === 'pix-expirado' && <Feedback type="error" title="O código Pix expirou" message="Gere um novo código para pagar. Você não perde o contrato." />}
            <GrupoOpcoes legenda="Como você quer pagar?" colunas={3}>
              <OpcaoCard name="forma" value="pix" checked={forma === 'pix'} onChange={v => setForma(v as Forma)} icone={<QrCode />} titulo="Pix" descricao="Aprovação na hora" />
              <OpcaoCard name="forma" value="credito" checked={forma === 'credito'} onChange={v => setForma(v as Forma)} icone={<CreditCard />} titulo="Crédito" descricao="Cartão de crédito" />
              <OpcaoCard name="forma" value="debito" checked={forma === 'debito'} onChange={v => setForma(v as Forma)} icone={<Landmark />} titulo="Débito" descricao="Cartão de débito" />
            </GrupoOpcoes>
            {forma === 'pix' ? (
              <div className={estilos.pix}>
                <span className={estilos.qr} aria-hidden="true"><QrCode size={64} /></span>
                <p className={styles.ajuda}>Abra o app do seu banco e leia o código, ou copie o código abaixo.</p>
                <Button variant="outline" iconLeft={<Copy size={20} />} onClick={() => setCopiado(true)}>Copiar código Pix</Button>
                {copiado && <p className={styles.ajuda} role="status">Código copiado.</p>}
              </div>
            ) : (
              <p className={styles.ajuda}>Os campos do cartão e os dados do pagador (como CPF, se o serviço exigir) aparecem aqui, no ambiente do serviço de pagamento.</p>
            )}
          </div>
        )}
      </Dialog>
    </FluxoShell>
  );
}

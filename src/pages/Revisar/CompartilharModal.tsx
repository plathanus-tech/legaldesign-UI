import { useState } from 'react';
import { Clock, Copy, Mail, PencilLine, Share2 } from 'lucide-react';
import { Button, Dialog, Feedback } from '../../index';
import { AvisoFlutuante, type AvisoFlutuanteDados } from '../fluxo/AvisoFlutuante';
import { LINK_EXEMPLO } from '../fluxo/contato';
import { dataFinal, PRAZO_DO_RESUMO } from '../fluxo/dias';
import { WhatsAppIcone } from '../fluxo/WhatsAppIcone';
import styles from './CompartilharModal.module.css';

/** Link de exemplo do protótipo. No produto, são gerados ao abrir o modal: um só para ver e outro para voltar e editar. */
export const LINK_PARA_CONFERIR = 'https://exemplo.com.br/resumo/ver/q4m8-2tzr';

const MENSAGEM = 'Olá! Estou montando um contrato de locação e queria que você conferisse o resumo. Se algo precisar mudar, é só me avisar.';

export interface CompartilharModalProps {
  open: boolean;
  onClose: () => void;
  /** Quantos dias o resumo ainda fica guardado (15 dias depois do primeiro envio). Os links valem só por esse tempo. */
  diasRestantes?: number;
}

/**
 * Compartilhar o resumo em um modal, aberto pelo botão "Compartilhar resumo" da revisão. Sem formulário: a plataforma não envia
 * nada nem guarda o contato de ninguém.
 * - "Enviar para conferir": link só de visualização. O WhatsApp e o e-mail abrem já com a mensagem e o link, e quem envia é a
 *   própria pessoa (do número e do e-mail dela). Também dá para copiar o link.
 * - "Voltar e editar depois": link para continuar o preenchimento, para copiar e guardar.
 * O aviso do topo diz por quantos dias os links valem, com a data final calculada. Sem lembrete por e-mail.
 *
 * NOTA PARA DESENVOLVIMENTO: o link de visualização e o de edição são diferentes e impossíveis de adivinhar (o resumo tem nomes e
 * endereço). O de visualização nunca permite editar. Em celulares, dá para oferecer também o menu nativo de compartilhar.
 */
export function CompartilharModal({ open, onClose, diasRestantes = PRAZO_DO_RESUMO }: CompartilharModalProps) {
  const [aviso, setAviso] = useState<AvisoFlutuanteDados | null>(null);

  const copiar = async (link: string) => {
    try { await navigator.clipboard.writeText(link); } catch { /* sem permissão: a pessoa pode copiar o link à mão */ }
    setAviso({ id: Date.now(), title: 'Link copiado', message: 'Agora é só colar onde quiser enviar.' });
  };
  const abrirWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${MENSAGEM} ${LINK_PARA_CONFERIR}`)}`, '_blank', 'noopener');
  const abrirEmail = () => { window.location.href = `mailto:?subject=${encodeURIComponent('Resumo do contrato de locação')}&body=${encodeURIComponent(`${MENSAGEM}\n\n${LINK_PARA_CONFERIR}`)}`; };

  return (
    <>
      <Dialog
        open={open} onClose={onClose} size="md" sheet
        title="Compartilhe o resumo"
        subtitle="Envie para outra pessoa conferir ou guarde um link para continuar editando depois."
      >
        <div className={styles.corpo}>
          {/* validade dos links: a data final é calculada a partir de hoje (15 dias no primeiro envio) */}
          <div className={styles.validade}>
            <Feedback type="info" icon={<Clock size={18} />} message={<>O resumo e os links ficam disponíveis até <strong>{dataFinal(diasRestantes)}</strong>.</>} />
          </div>

          <section className={styles.grupo} aria-labelledby="comp-conferir">
            <h3 id="comp-conferir" className={styles.h3}><Share2 size={16} aria-hidden="true" />Enviar para conferir</h3>
            <p className={styles.ajuda}>Quem receber poderá visualizar o resumo, mas não editar.</p>
            <div className={styles.botoes}>
              <Button variant="outline" iconLeft={<WhatsAppIcone size={20} />} onClick={abrirWhatsApp}>WhatsApp</Button>
              <Button variant="outline" iconLeft={<Mail size={20} />} onClick={abrirEmail}>E-mail</Button>
              <Button variant="outline" iconLeft={<Copy size={20} />} onClick={() => copiar(LINK_PARA_CONFERIR)}>Copiar link</Button>
            </div>
            <p className={styles.apoio}>O resumo mostra os dados preenchidos e as sugestões do sistema, sem exibir as cláusulas do contrato.</p>
          </section>

          <section className={styles.grupo} aria-labelledby="comp-editar">
            <h3 id="comp-editar" className={styles.h3}><PencilLine size={16} aria-hidden="true" />Continuar editando depois</h3>
            <p className={styles.ajuda}>Guarde este link para voltar ao preenchimento de onde parou. Ele permite editar as informações.</p>
            <div className={styles.botoes}>
              <Button variant="secondary" iconLeft={<Copy size={20} />} onClick={() => copiar(LINK_EXEMPLO)}>Copiar link para editar</Button>
            </div>
            <p className={styles.apoio}>Não compartilhe este link: ele permite editar as informações do contrato.</p>
          </section>
        </div>
      </Dialog>
      {/* "Link copiado." flutua no alto, centralizado, e some depois de alguns segundos */}
      <AvisoFlutuante aviso={aviso} />
    </>
  );
}

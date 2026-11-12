import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, Checkbox, Dialog, Feedback, Input, Spinner } from '../../index';
import { levarAoPrimeiroErro } from '../fluxo/AvisoDeErros';
import { emailValido, formatarTelefone, telefoneValido } from '../fluxo/contato';
import styles from '../fluxo/PaginaEtapa.module.css';
import estilos from './Finalizar.module.css';
import { SucessoEDownload } from './SucessoEDownload';

export interface EnviarPdfProps {
  /** Escolhas iniciais (para as stories mostrarem o modal preenchido). */
  inicial?: { nome?: string; email?: string; whatsapp?: string; porEmail?: boolean; porWhatsapp?: boolean };
  mostrarErros?: boolean;
  /** Mostra a falha no envio (para a story), com a opção de tentar de novo. */
  falhou?: boolean;
  onSair?: () => void;
  /** Fecha o modal e volta para o pagamento confirmado (5.1). */
  onVoltar?: () => void;
  /** O envio deu certo: volta para o pagamento confirmado (5.1), com a mensagem de sucesso. */
  onEnviado?: (canais: { email: boolean; whatsapp: boolean }) => void;
  onNovoContrato?: () => void;
}

/**
 * Tela 5.2: enviar o PDF por e-mail e/ou WhatsApp. É um modal sobre o pagamento confirmado (5.1), que continua por trás e não muda.
 * O e-mail já vem marcado; os campos de contato só aparecem para os canais marcados (o que foi digitado fica guardado se a pessoa
 * desmarcar e marcar de novo). Pelo menos um canal precisa ficar marcado. Durante o envio o botão mostra o carregamento e não aceita
 * novo clique; se falhar, o modal explica e deixa tentar de novo. O botão envia, não baixa o arquivo. Guardamos o nome e o contato por mais
 * tempo do que o resumo (prazo ainda por definir e validar), nunca o PDF. O provedor de envio por WhatsApp ainda não foi definido.
 */
export function EnviarPdf({ inicial, mostrarErros = false, falhou = false, onSair, onVoltar, onEnviado, onNovoContrato }: EnviarPdfProps) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [porEmail, setPorEmail] = useState(inicial?.porEmail ?? true);
  const [porWhatsapp, setPorWhatsapp] = useState(inicial?.porWhatsapp ?? false);
  const [email, setEmail] = useState(inicial?.email ?? '');
  const [whatsapp, setWhatsapp] = useState(inicial?.whatsapp ?? '');
  const [tentou, setTentou] = useState(mostrarErros);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState(falhou);
  const espera = useRef<number>();
  // ao marcar o WhatsApp, o campo (com o aviso de que o arquivo expira) é levado para a área visível do modal
  const campoWhats = useRef<HTMLDivElement>(null);
  const jaMontou = useRef(false);
  useEffect(() => {
    if (!jaMontou.current) { jaMontou.current = true; return; }
    if (porWhatsapp) campoWhats.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [porWhatsapp]);
  useEffect(() => () => window.clearTimeout(espera.current), []);

  const nada = !porEmail && !porWhatsapp;
  const erroNome = tentou && nome.trim() === '' ? 'Informe o seu nome.' : undefined;
  const erroEmail = tentou && porEmail && !emailValido(email) ? 'Informe um e-mail válido.' : undefined;
  const erroWhats = tentou && porWhatsapp && !telefoneValido(whatsapp) ? 'Informe o WhatsApp com DDD.' : undefined;

  const enviar = () => {
    if (enviando) return;
    setTentou(true);
    if (nome.trim() === '' || nada || (porEmail && !emailValido(email)) || (porWhatsapp && !telefoneValido(whatsapp))) {
      setFalha(false);
      // espera o erro aparecer na tela para levar a pessoa até ele
      window.setTimeout(levarAoPrimeiroErro, 0);
      return;
    }
    setFalha(false);
    setEnviando(true);
    // no protótipo, o envio é simulado
    espera.current = window.setTimeout(() => { setEnviando(false); onEnviado?.({ email: porEmail, whatsapp: porWhatsapp }); }, 1500);
  };

  // Enter num campo de texto envia (e, se algo estiver inválido, mostra o erro e leva ao primeiro campo). Não age durante o envio
  // nem quando o Enter só confirma uma sugestão do navegador ou da digitação (composição de texto).
  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || e.defaultPrevented || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229 || enviando) return;
    const alvo = e.target as HTMLElement;
    if (alvo.tagName !== 'INPUT' || ['checkbox', 'radio', 'button', 'file'].includes((alvo as HTMLInputElement).type)) return;
    e.preventDefault();
    enviar();
  };

  return (
    <>
      {/* a tela anterior fica por trás, sem mudar */}
      <SucessoEDownload onSair={onSair} onNovoContrato={onNovoContrato} />

      <Dialog
        open
        onClose={() => { if (!enviando) onVoltar?.(); }}
        title="Envie o PDF"
        subtitle="Mande o contrato por e-mail, por WhatsApp ou pelos dois. Você pode enviar para você mesmo ou para quem vai assinar."
        size="md"
        actions={
          <>
            <Button variant="secondary" disabled={enviando} onClick={onVoltar}>Voltar</Button>
            <Button iconLeft={enviando ? <Spinner size="sm" label="Enviando o PDF" /> : <Send size={20} />} disabled={enviando} onClick={enviar}>
              {enviando ? 'Enviando…' : falha ? 'Tentar de novo' : 'Enviar PDF'}
            </Button>
          </>
        }
      >
        <div className={estilos.envio} onKeyDown={aoTeclar}>
          {falha && <Feedback type="error" title="Não conseguimos enviar o PDF" message="O envio não foi concluído. Confira o contato e tente de novo. Seu contrato continua disponível nesta página." />}

          <div data-invalido={erroNome ? 'true' : undefined}>
            <Input label="Seu nome" value={nome} autoComplete="name" helperText="Aparece no começo da mensagem que enviamos" error={erroNome} disabled={enviando} onChange={e => setNome(e.target.value)} />
          </div>

          <fieldset className={estilos.envioCanais} data-invalido={tentou && nada ? 'true' : undefined} disabled={enviando}>
            <legend className={estilos.envioCanaisLegenda}>Como enviar</legend>
            <Checkbox label="E-mail" checked={porEmail} onChange={e => setPorEmail(e.target.checked)} />
            <Checkbox label="WhatsApp" checked={porWhatsapp} onChange={e => setPorWhatsapp(e.target.checked)} />
            {tentou && nada && <p className={styles.erroGrupo} role="alert">Escolha pelo menos uma forma de envio.</p>}
          </fieldset>

          {porEmail && <div data-invalido={erroEmail ? 'true' : undefined}><Input label="E-mail" value={email} type="email" inputMode="email" autoComplete="off" placeholder="nome@exemplo.com" error={erroEmail} disabled={enviando} onChange={e => setEmail(e.target.value)} /></div>}
          {porWhatsapp && <div ref={campoWhats} data-invalido={erroWhats ? 'true' : undefined}><Input label="WhatsApp (com DDD)" value={whatsapp} inputMode="tel" autoComplete="off" placeholder="(00) 00000-0000" helperText="O PDF fica disponível por tempo limitado no WhatsApp. Baixe e guarde o arquivo em um lugar seguro" error={erroWhats} disabled={enviando} onChange={e => setWhatsapp(formatarTelefone(e.target.value))} /></div>}

          <p className={estilos.nota}>Guardamos o seu nome e o contato usados no envio por mais tempo do que o resumo. Não guardamos o PDF do contrato.</p>
        </div>
      </Dialog>
    </>
  );
}

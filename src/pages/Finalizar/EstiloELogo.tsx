import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CircleX, Eye } from 'lucide-react';
import { Button, Checkbox, Dialog, ImageUpload, Input } from '../../index';
import { AvisoDeErros, levarAoPrimeiroErro } from '../fluxo/AvisoDeErros';
import { FluxoShell } from '../fluxo/FluxoShell';
import styles from '../fluxo/PaginaEtapa.module.css';
import { lerRespostas, salvarContrato } from '../fluxo/respostas';
import estilos from './Finalizar.module.css';
import { ESTILOS, type EstiloId } from './estilos';
import { PreviaDocumento } from './PreviaDocumento';
import { PreviaEstilo } from './PreviaEstilo';

export type { EstiloId } from './estilos';

export interface EstiloELogoProps {
  /** Escolhas iniciais (para as stories mostrarem a tela preenchida). Sem isso, usa a sessão do protótipo. */
  inicial?: { estilo?: EstiloId; corretor?: string; aceites?: boolean };
  /** Já mostra o que falta (como depois de tentar seguir). */
  mostrarErros?: boolean;
  onSair?: () => void;
  onVoltar?: () => void;
  onSeguinte?: () => void;
}

/** Texto provisório dos dois documentos. Trocar pelo conteúdo exato que o cliente enviar. */
const LOREM = 'Texto provisório. Aqui entra o conteúdo definitivo do documento, que será enviado pelo cliente.';
const DOCUMENTOS_PROVISORIOS = {
  termos: [
    { titulo: '1. Sobre o serviço', texto: LOREM },
    { titulo: '2. Como usar a plataforma', texto: LOREM },
    { titulo: '3. Pagamento e entrega do PDF', texto: LOREM },
    { titulo: '4. Responsabilidades', texto: LOREM },
  ],
  privacidade: [
    { titulo: '1. Quais dados usamos', texto: LOREM },
    { titulo: '2. Para que usamos', texto: LOREM },
    { titulo: '3. Onde ficam os dados', texto: LOREM },
    { titulo: '4. Seus direitos', texto: LOREM },
  ],
};

/**
 * Tela 3.1: estilo do contrato, logo e aceites. O estilo (o layout visual do PDF) é escolhido depois do formulário, com
 * uma prévia borrada para não mostrar o conteúdo. O logo é opcional, só vai para o PDF e não é guardado. Se o contrato foi
 * feito com um corretor ou imobiliária, ele pode ser indicado no documento. Antes de pagar, a orientação de que o PDF não muda
 * depois do pagamento aparece como texto simples, junto da confirmação explícita (checkbox). Os Termos de uso e a Política de Privacidade
 * têm um único aceite (checkbox), separado da confirmação e perto do fim da tela; os dois documentos abrem em uma janela, com texto provisório.
 */
export function EstiloELogo({ inicial, mostrarErros = false, onSair, onVoltar, onSeguinte }: EstiloELogoProps) {
  const sessao = useMemo(() => lerRespostas(), []);
  const [estilo, setEstilo] = useState<EstiloId | null>(inicial?.estilo ?? (sessao.contrato?.['fi-estilo'] as EstiloId | undefined) ?? null);
  const [corretor, setCorretor] = useState(inicial?.corretor ?? sessao.contrato?.['fi-corretor'] ?? (sessao.administracao === 'imobiliaria' ? (sessao.imobiliaria?.nome ?? '') : ''));
  const [logo, setLogo] = useState<{ nome: string; url: string; tamanho: number } | null>(null);
  const [termos, setTermos] = useState(inicial?.aceites ?? false);
  const [conferiu, setConferiu] = useState(inicial?.aceites ?? false);
  const [tentou, setTentou] = useState(mostrarErros);
  // janela com uma parte do documento no estilo escolhido (texto das cláusulas borrado)
  const [previa, setPrevia] = useState<EstiloId | null>(null);
  // janela com os Termos de uso e a Política de Privacidade (texto provisório até o cliente enviar o conteúdo)
  const [documento, setDocumento] = useState<'termos' | 'privacidade' | null>(null);

  useEffect(() => { salvarContrato({ 'fi-estilo': estilo ?? '', 'fi-corretor': corretor }); }, [estilo, corretor]);
  useEffect(() => () => { if (logo) URL.revokeObjectURL(logo.url); }, [logo]);

  const falta = (estilo === null ? 1 : 0) + (conferiu ? 0 : 1) + (termos ? 0 : 1);
  // Um erro: vai direto a ele. Vários: vai ao primeiro e mostra o aviso centralizado no alto (ver AvisoDeErros)
  const [tentativa, setTentativa] = useState(0);
  const seguir = () => {
    setTentou(true);
    if (falta === 0) { onSeguinte?.(); return; }
    setTentativa(n => n + 1);
    levarAoPrimeiroErro();
  };
  const escolherLogo = (arquivo: File | null) => {
    if (logo) URL.revokeObjectURL(logo.url);
    setLogo(arquivo ? { nome: arquivo.name, url: URL.createObjectURL(arquivo), tamanho: arquivo.size } : null);
  };

  return (
    <FluxoShell modelo="Contrato de locação de imóvel" etapa={2} pagina={{ atual: 1 }} resumo={[]} resumoLateral={false} onSair={onSair}>
      <div className={styles.pagina}>
        <header className={styles.intro}>
          <h1 className={styles.h1}>Escolha como o contrato vai ficar</h1>
          <p className={styles.lead}>Escolha o estilo do documento e, se quiser, adicione seu logo. O conteúdo é o mesmo em todos os estilos.</p>
        </header>

        <section className={styles.secao} aria-label="Estilo do contrato">
          <fieldset className={estilos.estilos} data-invalido={tentou && estilo === null ? 'true' : undefined} aria-describedby={tentou && estilo === null ? 'estilo-erro' : undefined}>
            <legend className={estilos.legenda}>Qual estilo você prefere?</legend>
            <p className={styles.ajuda}>Em ‘Ver prévia’, você confere uma parte do documento para conhecer o estilo, sem exibir o texto das cláusulas.</p>
            <div className={estilos.grade}>
              {ESTILOS.map(e => (
                <div key={e.valor} className={estilos.estilo}>
                  <input type="radio" id={`estilo-${e.valor}`} name="estilo" value={e.valor} checked={estilo === e.valor} onChange={() => setEstilo(e.valor)} className={estilos.radio} aria-describedby={`estilo-${e.valor}-desc estilo-${e.valor}-preco`} />
                  <label htmlFor={`estilo-${e.valor}`} className={estilos.estiloCorpo}>
                    <PreviaEstilo estilo={e.valor} />
                    <span className={estilos.estiloTexto}>
                      <span className={estilos.estiloTitulo}>{e.titulo}</span>
                      <span className={estilos.estiloDesc} id={`estilo-${e.valor}-desc`}>{e.descricao}</span>
                      <span className={estilos.estiloPreco} id={`estilo-${e.valor}-preco`}>{e.preco}</span>
                    </span>
                  </label>
                  <button type="button" className={`${estilos.linkBotao} ${estilos.linkPrevia}`} onClick={() => setPrevia(e.valor)} aria-label={`Ver prévia do estilo ${e.titulo}`} aria-describedby={`estilo-${e.valor}-desc`}><Eye size={20} aria-hidden="true" />Ver prévia</button>
                </div>
              ))}
            </div>
            {tentou && estilo === null && <p id="estilo-erro" className={estilos.erroEstilo} aria-live="polite"><CircleX size={14} className={estilos.erroIcone} aria-hidden="true" />Escolha um estilo para continuar. Em “Ver prévia”, você vê como cada um fica.</p>}
          </fieldset>
        </section>

        <section className={styles.secao} aria-label="Logo e indicação">
          <h2 className={styles.h2}>Quer personalizar?</h2>
          <ImageUpload
            label="Logo do documento"
            optional
            helperText="Aparece só no PDF, no alto da primeira folha. Não guardamos a imagem"
            fileName={logo?.nome}
            previewUrl={logo?.url}
            fileSize={logo?.tamanho}
            thumbFit="contain"
            onChange={escolherLogo}
            accept="image/png,image/jpeg"
            maxSizeBytes={2 * 1024 * 1024}
            labels={{ add: 'Adicionar logo', replace: 'Trocar', remove: 'Remover', loading: 'Carregando logo...', invalidType: 'Envie uma imagem JPG ou PNG', tooLarge: 'A imagem é maior que 2 MB' }}
          />
          <Input
            label="Corretor ou imobiliária"
            optional
            value={corretor}
            autoComplete="off"
            helperText="Se preencher, o contrato indica que foi feito com a ajuda dessa pessoa ou empresa"
            onChange={e => setCorretor(e.target.value)}
          />
        </section>

        {/* 2 e 3: a orientação e a confirmação formam um só contexto, sem caixa de alerta */}
        <section className={styles.secao} aria-label="Confira as informações do contrato">
          <h2 className={styles.h2}>Confira as informações do contrato</h2>
          <p className={estilos.textoInfo}>Após o pagamento, o PDF não poderá ser alterado. Se encontrar algum erro, será necessário preencher um novo contrato.</p>
          <div data-invalido={tentou && !conferiu ? 'true' : undefined}><Checkbox id="confirmacao" label="Conferi as informações do contrato e estou ciente de que o PDF não poderá ser alterado após o pagamento." checked={conferiu} onChange={e => setConferiu(e.target.checked)} error={tentou && !conferiu ? 'Marque esta confirmação para ir ao pagamento.' : undefined} /></div>
        </section>

        {/* 4 e 5: um único aceite, separado da confirmação, com os dois documentos abertos em janela */}
        <section className={estilos.aceite} aria-label="Termos de uso e Política de Privacidade" data-invalido={tentou && !termos ? 'true' : undefined}>
          <Checkbox
            label={<>Li e aceito os <button type="button" className={estilos.linkBotao} onClick={() => setDocumento('termos')}>Termos de uso</button> e a <button type="button" className={estilos.linkBotao} onClick={() => setDocumento('privacidade')}>Política de Privacidade</button>.</>}
            id="aceite-termos"
            checked={termos}
            onChange={e => setTermos(e.target.checked)}
            error={tentou && !termos ? 'Marque o aceite dos Termos de uso e da Política de Privacidade para ir ao pagamento.' : undefined}
          />
        </section>

        <div className={styles.acoes}>
          <Button variant="ghost" onClick={onVoltar}>Voltar à revisão</Button>
          <Button iconRight={<ArrowRight size={20} />} onClick={seguir}>Ir para o pagamento</Button>
        </div>
      </div>

      <AvisoDeErros tentativa={tentativa} quantidade={falta} frase={n => `Faltam ${n} itens para ir ao pagamento. Eles estão marcados em vermelho.`} />

      <Dialog
        open={previa !== null}
        onClose={() => setPrevia(null)}
        title={previa ? `Prévia do estilo ${ESTILOS.find(x => x.valor === previa)?.titulo}` : ''}
        subtitle="Veja como o documento fica. O texto das cláusulas aparece borrado."
        size="lg"
        actions={
          <>
            <Button onClick={() => { if (previa) setEstilo(previa); setPrevia(null); }}>Escolher este estilo</Button>
          </>
        }
      >
        {previa && <PreviaDocumento estilo={previa} logoUrl={logo?.url} />}
      </Dialog>

      <Dialog
        open={documento !== null}
        onClose={() => setDocumento(null)}
        title={documento === 'privacidade' ? 'Política de Privacidade' : 'Termos de uso'}
        subtitle="Texto provisório. O conteúdo definitivo será enviado pelo cliente."
        size="lg"
        sheet
      >
        <div className={estilos.documentoLegal}>
          {DOCUMENTOS_PROVISORIOS[documento ?? 'termos'].map(b => (
            <section key={b.titulo}>
              <h3 className={estilos.documentoTitulo}>{b.titulo}</h3>
              <p className={estilos.documentoTexto}>{b.texto}</p>
            </section>
          ))}
        </div>
      </Dialog>
    </FluxoShell>
  );
}

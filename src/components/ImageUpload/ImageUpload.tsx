import { DragEvent, useRef, useState } from 'react';
import { AlertTriangle, ImageIcon, ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { FormField } from '../FormField/FormField';
import { Spinner } from '../Spinner/Spinner';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './ImageUpload.module.css';

export interface ImageUploadLabels {
  /** Ação do estado vazio. */
  add: string;
  /** Botão de trocar a imagem (nome acessível: “<replace>: <label>”). */
  replace: string;
  /** Botão de remover a imagem (nome acessível: “<remove>: <label>”). */
  remove: string;
  /** Texto exibido e anunciado durante o envio. */
  loading: string;
  /** Mensagem de formato inválido. */
  invalidType: string;
  /** Mensagem de arquivo acima do limite (só usada quando `maxSizeBytes` é informado). */
  tooLarge: string;
}

const DEFAULT_LABELS: ImageUploadLabels = {
  add: 'Adicionar foto',
  replace: 'Trocar foto',
  remove: 'Remover foto',
  loading: 'Enviando foto...',
  invalidType: 'Envie uma imagem JPG ou PNG',
  tooLarge: 'A imagem é maior que o tamanho permitido',
};

/** 511 KB, 1,2 MB: o tamanho do jeito que a pessoa lê. */
function tamanhoDoArquivo(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

export interface ImageUploadProps {
  /** Rótulo visível do campo (também nomeia as ações de trocar/remover). */
  label: string;
  /** Campo opcional: mostra “(opcional)” ao lado do rótulo. */
  optional?: boolean;
  /** Texto auxiliar no estado vazio (ex.: formatos aceitos). Padrão: “JPG ou PNG”; ajuste junto com `accept`. */
  helperText?: string;
  /** Nome do arquivo atual; vazio = estado vazio. */
  fileName?: string;
  /** URL da miniatura (ex.: `URL.createObjectURL`). Sem ela, mostra um ícone de imagem no lugar. */
  previewUrl?: string;
  /** Tamanho do arquivo em bytes: aparece sob o nome (ex.: “511 KB”). */
  fileSize?: number;
  /** Como a imagem preenche a miniatura: `cover` recorta (fotos); `contain` mostra inteira (logos). Padrão: `cover`. */
  thumbFit?: 'cover' | 'contain';
  /** Chamado com o arquivo válido escolhido (ou solto) e com `null` ao remover. */
  onChange: (file: File | null) => void;
  /** Aguardando o envio/processamento do arquivo. */
  loading?: boolean;
  /** Erro vindo de fora (ex.: servidor). Erros de formato/tamanho são tratados pelo componente. */
  error?: string;
  /** Desabilita a escolha, a troca e a remoção da imagem. */
  disabled?: boolean;
  /** Tipos aceitos no seletor e validados ao soltar. Padrão: JPG e PNG. */
  accept?: string;
  /** Limite de tamanho em bytes. Sem valor, nenhum limite é validado (não invente limite que a regra de negócio não definiu). */
  maxSizeBytes?: number;
  /** Textos visíveis e de acessibilidade (i18n). Padrão em pt-BR. */
  labels?: Partial<ImageUploadLabels>;
  className?: string;
}

/**
 * Upload de uma imagem, compacto: área clicável (e que aceita arrastar e soltar) no estado vazio; com a imagem
 * escolhida mostra miniatura, nome do arquivo e as ações Trocar/Remover. Compõe `FormField`.
 * A cor primária destaca só a ação (ícone e texto); fundo e borda são neutros.
 */
export function ImageUpload({
  label, optional, helperText = 'JPG ou PNG', fileName, previewUrl, fileSize, thumbFit = 'cover', onChange, loading = false, error, disabled = false,
  accept = 'image/png,image/jpeg', maxSizeBytes, labels, className,
}: ImageUploadProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const shownError = error ?? localError;
  const hasFile = !!fileName;
  const types = accept.split(',').map((x) => x.trim());

  const pick = () => { if (!disabled && !loading) inputRef.current?.click(); };
  const accepts = (file: File) => types.some((tp) => (tp.endsWith('/*') ? file.type.startsWith(tp.slice(0, -1)) : file.type === tp));
  const take = (file?: File) => {
    if (!file) return;
    if (!accepts(file)) { setLocalError(t.invalidType); return; }
    if (maxSizeBytes && file.size > maxSizeBytes) { setLocalError(t.tooLarge); return; }
    setLocalError(undefined);
    onChange(file);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && !loading) take(e.dataTransfer.files?.[0]);
  };
  const onDrag = (e: DragEvent, on: boolean) => { e.preventDefault(); if (!disabled && !loading) setDragging(on); };

  return (
    <FormField label={label} optional={optional} error={shownError} hideErrorIcon={false} className={className}>
      {(control) => (
        <>
          <input
            ref={inputRef} type="file" accept={accept} className={styles.input} tabIndex={-1} aria-hidden="true" disabled={disabled}
            onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }}
          />
          {loading ? (
            <div className={cx(styles.box, styles.loading)} aria-busy="true">
              <Spinner size="sm" label={t.loading} />
              <span className={styles.helper} aria-hidden="true">{t.loading}</span>
            </div>
          ) : hasFile ? (
            <div className={cx(styles.box, styles.filled, disabled && styles.disabled)} role="group" aria-label={label}>
              <span className={cx(styles.thumb, thumbFit === 'contain' && styles.thumbContain)}>
                {previewUrl ? <img src={previewUrl} alt="" /> : <ImageIcon size={24} aria-hidden="true" />}
              </span>
              <span className={styles.meta}>
                <span className={styles.name} title={fileName}>{fileName}</span>
                {fileSize !== undefined && <span className={styles.caption}>{tamanhoDoArquivo(fileSize)}</span>}
              </span>
              <span className={styles.actions}>
                <Tooltip content={t.replace} placement="top">
                  <Button variant="ghost" size="sm" iconOnly iconLeft={<RefreshCw size={16} />} disabled={disabled} onClick={pick} aria-label={`${t.replace}: ${label}`} />
                </Tooltip>
                <Tooltip content={t.remove} placement="top">
                  <Button variant="ghost" size="sm" iconOnly iconLeft={<Trash2 size={16} />} disabled={disabled} onClick={() => { setLocalError(undefined); onChange(null); }} aria-label={`${t.remove}: ${label}`} />
                </Tooltip>
              </span>
            </div>
          ) : (
            <button
              {...control}
              type="button"
              className={cx(styles.box, styles.drop, dragging && styles.dragging, shownError && styles.invalid)}
              disabled={disabled}
              onClick={pick}
              onDragEnter={(e) => onDrag(e, true)} onDragOver={(e) => onDrag(e, true)} onDragLeave={(e) => onDrag(e, false)} onDrop={onDrop}
            >
              <span className={styles.icon} aria-hidden="true">{shownError ? <AlertTriangle size={24} /> : <ImagePlus size={24} />}</span>
              <span className={styles.texts}>
                <span className={styles.action}>{t.add}</span>
                <span className={styles.helper}>{helperText}</span>
              </span>
            </button>
          )}
        </>
      )}
    </FormField>
  );
}

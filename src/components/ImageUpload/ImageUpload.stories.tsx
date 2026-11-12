import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Components/ImageUpload',
  component: ImageUpload,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Upload de uma imagem, compacto. Vazio: área clicável (aceita arrastar e soltar) com ícone, “Adicionar foto” e o formato aceito. Com imagem: miniatura, nome do arquivo e ações Trocar/Remover. A cor primária destaca só a ação; fundo e borda são neutros. Compõe `FormField`. Não valida limite de tamanho a menos que `maxSizeBytes` seja informado.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ImageUpload>;

/** Controlado com estado local: escolhe o arquivo, mostra “enviando” por instantes e depois a miniatura. */
function Live(props: Partial<React.ComponentProps<typeof ImageUpload>>) {
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <ImageUpload
      label="Imagem do produto" optional {...props}
      fileName={file?.name} previewUrl={file?.url} loading={loading}
      onChange={(f) => {
        if (!f) { setFile(null); return; }
        setLoading(true);
        window.setTimeout(() => { setFile({ name: f.name, url: URL.createObjectURL(f) }); setLoading(false); }, 700);
      }}
    />
  );
}

export const Empty: Story = { render: () => <Live /> };
export const Loading: Story = { args: { label: 'Imagem do produto', optional: true, loading: true, onChange: () => undefined } };
export const WithImage: Story = {
  args: {
    label: 'Imagem do produto', optional: true, fileName: 'produto-frente.jpg', onChange: () => undefined,
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23cbd5e1"/><circle cx="22" cy="24" r="8" fill="%2394a3b8"/><path d="M0 64 24 36 40 52 52 40 64 54V64Z" fill="%2394a3b8"/></svg>',
  },
};
export const FileWithoutPreview: Story = { args: { label: 'Imagem de capa', optional: true, fileName: 'capa.png', onChange: () => undefined } };
export const LogoWithCaption: Story = { name: 'Logo, com tamanho e imagem inteira', args: { label: 'Logo', optional: true, fileName: 'logo-empresa.png', fileSize: 523264, thumbFit: 'contain', onChange: () => undefined } };
export const Error: Story = { args: { label: 'Imagem do produto', optional: true, error: 'Envie uma imagem JPG ou PNG', onChange: () => undefined } };
export const Disabled: Story = { args: { label: 'Imagem do produto', optional: true, disabled: true, onChange: () => undefined } };
export const DisabledWithImage: Story = { args: { label: 'Imagem do produto', optional: true, disabled: true, fileName: 'produto-frente.jpg', onChange: () => undefined } };
export const TwoSideBySide: Story = {
  decorators: [(Story) => <div style={{ width: 720 }}><Story /></div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Live label="Imagem do produto" />
      <Live label="Imagem de capa" />
    </div>
  ),
};

/** Textos sobrescritos via `labels` (i18n) e limite de tamanho validado pelo componente. */
export const CustomLabels: Story = {
  render: () => (
    <Live
      label="Product image"
      helperText="JPG or PNG, up to 2 MB"
      maxSizeBytes={2 * 1024 * 1024}
      labels={{ add: 'Add image', replace: 'Replace', remove: 'Remove', loading: 'Uploading image...', invalidType: 'Upload a JPG or PNG image', tooLarge: 'The image is larger than 2 MB' }}
    />
  ),
};

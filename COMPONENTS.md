# Catálogo de componentes

Ponto único de importação: `import { Button, Input } from '<caminho>/src'` (ver `src/index.ts`).
Cada componente tem story com props e exemplos em `Components/<Nome>`; composições prontas em `Patterns/Composições`.
Tudo abaixo está em ordem alfabética.

**Índice A–Z:** Accordion · AppHeader · Avatar · Badge · Breadcrumb · Button · Card · Checkbox · DatePicker · Dialog · Dropdown · EmptyState · Feedback · FormField · ImageUpload · Input · MultiSelect · Pagination · Popover · RadioButton · Sidebar · Spinner · Stack · Tab · Table · Textarea · Toast · Toggle · Tooltip

## Como escolher (por necessidade)

| Preciso de… | Use | Não use / observação |
|---|---|---|
| Ação clicável | `Button` (`primary` 1 por área · `secondary` · `destructive` · `ghost` · `outline` com borda neutra, para configuração da tela como "Colunas" ou "Filtros") | Não crie `CustomButton`. Só ícone → `iconOnly` + `aria-label`. |
| Agrupar conteúdo relacionado | `Card` (`padding="none"` p/ tabelas) | Não faça `div` com borda/sombra própria |
| Alternar seções de conteúdo | `Tab` | — |
| Barra superior | `AppHeader` (recebe `logo`, `actions`) | — |
| Campo de data | `DatePicker` (valor ISO `YYYY-MM-DD`) | Não use `<input type="date">`: o calendário é do navegador e não segue a identidade |
| Campo de tipo novo (hora, cor…) | `FormField` + `fieldControlClass` no controle | Não reimplemente label/erro/ajuda |
| Campo de texto (1 linha) | `Input` | Dados pessoais: passe `autoComplete` |
| Campo de texto (várias linhas) | `Textarea` | — |
| Carregando | `Spinner` | Em tabela: prop `loading` |
| Confirmação efêmera após ação | `Toast` (`ToastProvider` + `useToast`) | — |
| Confirmar/decidir sem sair da tela | `Dialog` | — |
| Dica curta em hover/foco | `Tooltip` | Nunca para conteúdo essencial |
| Enviar uma imagem/foto (com miniatura) | `ImageUpload` | Não use `<input type="file">` solto nem `Input readOnly` para isso |
| Escolher 1 entre poucas opções visíveis | `RadioButton` | Mais de ~5 opções → `Dropdown` |
| Escolher 1 opção de uma lista | `Dropdown` (no celular abre como folha inferior; lista longa → `searchable`) | Poucas opções visíveis (até ~5) → `RadioButton` |
| Escolher várias opções de uma lista | `MultiSelect` (tags removíveis no campo) | Poucas opções visíveis → vários `Checkbox` |
| Espaçar/alinhar elementos | `Stack` | Não escreva CSS de página com `display:flex; gap` |
| Estado de um registro (Ativo, Pendente) | `Badge` | Em tabela: coluna `type: 'badge'` |
| Foto/iniciais de pessoa | `Avatar` | — |
| Lista de dados tabulares | `Table` (colunas por `type`) | Não crie `NewTable` |
| Lista/seção sem dados | `EmptyState` | Em tabela: não use `EmptyState` solto; use `Table` com `emptyVariant` (`no-records` ou `no-results`) |
| Ligar/desligar com efeito imediato | `Toggle` | — |
| Marcar/desmarcar (envia depois) | `Checkbox` | Consentimento: nunca pré-marcado |
| Menu lateral de área logada | `Sidebar` (recebe `items`, `logo`, `user`) | Permissões por papel ficam no produto. Seção com páginas filhas → `children` no item (grupo recolhível, um nível) |
| Mensagem permanente na página | `Feedback` | — |
| Painel ancorado a um botão (filtros de tabela) | `Popover` | Sem decisão obrigatória; no mobile, prefira `Dialog` com `sheet` |
| Muitas páginas de dados | `Table` com prop `pagination` (rodapé dentro da tabela) | Fora de tabela: `Pagination` |
| Busca/filtros de uma tabela | `Table` com prop `toolbar` (dentro do card) | Não coloque os filtros soltos acima da tabela |
| Perguntas/seções expansíveis | `Accordion` | — |
| Trilha de navegação | `Breadcrumb` | — |

## Componentes (A–Z)

| Componente | Variantes / props-chave | Tokens que controlam a aparência |
|---|---|---|
| **Accordion** | `items` (`title` `subtitle` `collapsedSubtitle` `meta` `collapsedMeta` `content`) `allowMultiple` `defaultOpenIndex` `headingLevel` `variant` cards (padrão) · lines (só linhas, sem caixa: use dentro de `Dialog`/superfícies brancas) | `--radius-control`, `--font-display`, `--font-weight-heading` |
| **AppHeader** | `logo` `actions` `align` | `--color-bg-surface`, `--z-sticky` |
| **Avatar** | `name` `src` `size` | `--color-bg-brand`, `--color-text-brand` |
| **Badge** | `status` neutral/brand/success/error/warning/info · `dot` · `icon` · `solid` (só error) | `--color-status-*`, `--radius-pill` |
| **Breadcrumb** | `items` (label, href, icon) | `--color-text-*` |
| **Button** | `variant` primary/secondary/destructive/ghost/outline · `size` sm (36px)/md (≥ 44px, texto 16px)/lg · `iconLeft/Right` · `iconOnly` | `--color-action-*`, `--color-on-action-*`, `--radius-control(-sm)`, `--control-*`, `--text-button-*` |
| **Card** | `title` (texto ou ReactNode) `subtitle` `actions` `footer` `padding` none/md/lg (16px no mobile) | `--color-bg-surface`, `--color-border-card`, `--radius-card` |
| **Checkbox** | `label` (aceita ReactNode, ex.: link) `checked` `indeterminate` `disabled` | `--color-action-primary`, `--radius-control-sm` |
| **DatePicker** | `value` (ISO) `onChange` `label` `optional` `size="sm"` (36px, filtros) `min` `max` `locale` `weekStartsOn` `showShortcuts` `labels` (teclado: setas, Home/End, PageUp/Down, Esc; calendário em portal, não é cortado por Card/Dialog) | idem Input + `--color-bg-raised`, `--radius-overlay`, `--z-dropdown` |
| **Dialog** | `open` `onClose` `title` `subtitle` `actions` `size` `sheet` (folha inferior ≤ 640px) · `children` opcional | `--color-bg-raised`, `--radius-overlay`, `--color-overlay`, `--z-overlay` |
| **Dropdown** | `options` (`label` `value` + opcionais `description` `leading` `keywords`) `searchable` (busca sem acento) `size="sm"` `value` `onChange` `label` `optional` `aria-label` `error` `emptyText/emptyAction` (teclado: setas, Enter, Esc, Home/End; menu em portal; abre para cima se faltar espaço; ≤ 640px vira folha inferior) | idem Input, `--color-bg-raised`, `--color-overlay`, `--z-dropdown`, `--z-overlay` |
| **EmptyState** | `icon` `title` `description` `action` `compact` `headingLevel` | `--color-text-*`, `--font-weight-heading` |
| **Feedback** | `type` success/error/warning/info · `title` `message` `link` `dismissible` | `--color-status-*` |
| **FormField** | `label` `helperText` `error` `success` `optional` (+ `optionalLabel`) `labelAction` `size` md/sm · children = `(control) => …` · **Convenção:** marque só os campos opcionais com "(opcional)"; obrigatórios não levam asterisco (`required` segue para validação e ARIA) | `--color-text-*`, `--color-text-placeholder`, `--font-weight-label`, `--color-status-*` |
| **ImageUpload** | `label` `optional` `fileName` `previewUrl` `onChange(file ou null)` `loading` `error` `disabled` `accept` `maxSizeBytes` `helperText` `labels` · vazio: área clicável + arrastar e soltar; com imagem: miniatura, Trocar/Remover | `--color-action-primary`, `--color-border-*`, `--focus-glow*` |
| **Input** | props de `<input>` + `label` `helperText` `error` `success` `optional` `labelAction` `fieldSize` md/sm `iconLeft/Right` · ícone clicável: `onIconRightClick` + `iconRightLabel` (+ `iconRightPressed` para alternâncias) | `--radius-control`, `--focus-glow*`, `--color-border-*` |
| **MultiSelect** | `options` `value` (array) `onChange` `label` `optional` `error` `disabled` `emptyText` (teclado: setas, Home/End, Enter/Espaço, Esc; ≤ 640px vira folha inferior) | idem Dropdown |
| **Pagination** | `page` `pageCount` `onPageChange` | herda de Button |
| **Popover** | `open` `onClose` `anchorRef` `label` `align` start/end `fit` · filhos livres (Esc e clique fora fecham e devolvem o foco) | `--color-bg-raised`, `--shadow-lg`, `--z-dropdown` |
| **RadioButton** | `options` `value` `onChange` `name` `label` `orientation` | `--color-action-primary` |
| **Sidebar** | `items` (com `children` vira grupo recolhível) `logo` `activeItem` `onNavClick` `user` `onLogout` `open` `onToggle` `variant` rail/menu `themeToggle` `version` `labels` | `--color-nav-*` |
| **Spinner** | `size` `label` | `--color-action-primary` |
| **Stack** | `direction` `gap` (escala `--spacing-*`) `align` `justify` `wrap` `as` | `--spacing-*` |
| **Tab** | `tabs` `defaultIndex` `onChange` (a aba ativa rola para a área visível) | `--color-text-brand` (aba ativa, contraste AA), `--font-weight-button` |
| **Table** | `columns` (`type`: text/link/badge/avatar/toggle/actions · `sticky: 'right'` · `headerContent`) `rows` `loading` `emptyVariant` no-records/no-results `empty` `onClearFilters` `emptyLabels` `sortKey/sortDir/onSort` `pagination` `toolbar` `actions` · **Regra:** ações (e colunas `sticky`) sempre por último e fixas à direita, só as demais rolam; scrollbar segue o padrão global. **Vazios:** a tabela mantém título, busca, filtros e cabeçalho; só a área das linhas vira o estado vazio (ver abaixo) | `--color-bg-surface`, `--color-bg-stripe`, `--color-border-card`, `--font-weight-label` (cabeçalho) |
| **Textarea** | props de `<textarea>` + `label` `helperText` `error` | idem Input |
| **Toast** | `useToast().show({ type, message, title, duration })` | herda de Feedback, `--z-toast` |
| **Toggle** | `label` `checked` `size` sm/md | `--color-action-primary`, `--radius-pill` |
| **Tooltip** | `content` `placement` · filho focável | `--color-bg-inverse`, `--z-tooltip` |

## Composição típica

- **Formulário:** `Card` (footer com `Button`s) → `Stack` → `Input`/`Dropdown`/`DatePicker`/`Textarea`/`Checkbox`.
  **Espaçamento padrão:** 16px entre campos (`Stack gap="md"`), 24px do último campo até o botão principal (`gap="lg"` entre o grupo de campos e o grupo de ações) e 16px entre o botão e ações secundárias/links abaixo dele (`gap="md"`). Campos e botões `md`: 44px de altura (`--control-height-md`), texto 16px. Marque só os opcionais com "(opcional)". Erros por campo via prop `error`; resumo via `Feedback`.
- **Listagem:** `Table` com `actions` (botão principal no cabeçalho), `toolbar` (busca/filtros, `Popover` para filtros extras) e `pagination`.
- **Tabela vazia** (story *Components/Table › Vazio*), sempre dentro da própria `Table`, nunca como página ou modal:
  - **Sem cadastros** (`emptyVariant="no-records"`): ícone do módulo (`empty.icon`), título contextual ("Nenhum equipamento cadastrado"), descrição com o próximo passo e o botão de criação ("Novo equipamento") em `empty.action`. Busca e filtros ficam visíveis, porém desabilitados, e a ordenação é desativada. Não repita o botão de criação no cabeçalho do card nesse estado.
  - **Nenhum resultado** (`emptyVariant="no-results"`, padrão): ícone fixo (lupa), igual em todos os módulos; título e descrição padrão; `onClearFilters` mostra "Limpar busca e filtros". Busca e filtros seguem ativos; a mensagem é anunciada ao leitor de tela.
- **Área logada:** `Sidebar` + conteúdo com `Card`s.

Exemplos executáveis: story **Patterns/Composições**.

## Quando um componente novo é justificado

Só se **todas** as respostas forem "não":
1. Existe componente (ou prop/variante) que faça isso? Revise as tabelas acima.
2. Uma composição de componentes existentes resolve? (`Card` + `Stack` + …)
3. É apenas ajuste de aparência? Ajuste **tokens** em `brand.css`, não crie componente.

Se ainda assim faltar, proponha o componente antes de implementar: nome, problema que resolve, props, tokens usados, estados (hover, foco, disabled, erro) e requisitos de acessibilidade. Depois de aprovado, crie em `src/components/<Nome>/` (tsx + module.css + stories), exporte em `src/index.ts` **na posição alfabética** e adicione uma linha aqui (índice A–Z e tabela).

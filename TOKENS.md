# Foundations e customização de identidade

A identidade de um projeto é trocada **somente em `src/tokens/brand.css`**.
`src/tokens/tokens.css` é da Base — não edite por projeto. Componentes não contêm valores visuais fixos.

## O que editar em `brand.css`

| Token | Efeito | Obrigatório |
|---|---|---|
| `--brand-primary` | Gera `--color-brand-50…950`; alimenta `action-primary`, links de marca, foco, Sidebar, Tabs, Toggle… | Sim (já vem com verde padrão) |
| `--brand-secondary` | Gera `--color-secondary-50…950` e `--color-action-secondary-*` | Não |
| `--font-display` | Títulos (`h1–h6`), botões, abas, cabeçalho de tabela, títulos de Feedback/Accordion | Não |
| `--font-body` | Textos, labels, campos, tabelas, descrições | Não |
| `--font-weight-heading` · `-button` · `-label` · `-body` · `-caption` | Pesos semânticos (padrão: 600 · 600 · 500 · 400 · 400). Componentes usam estes, não os crus. Para mudar o peso da marca, sobrescreva em `brand.css` | Não |
| `--radius-scale` | Multiplica toda a escala de radius (1 padrão · 0 quadrado · 1.5 suave) | Não |

- **Uma cor da marca:** informe só `--brand-primary`; para a secundária use `--brand-secondary: var(--brand-primary)` ou deixe o padrão.
- **Duas cores:** informe as duas.
- **Contraste:** `--brand-primary` precisa de contraste ≥ 4.5:1 com branco (texto do botão). Cor clara? Defina também `--color-on-action-primary` (ex.: `var(--color-gray-950)`).
- **Uma fonte:** `--font-display: var(--font-body);` **Duas fontes:** informe as duas.
- **Carregar fontes:** use pacotes `@fontsource/<fonte>` (servidos localmente, sem requisição a terceiros) e troque as importações em `.storybook/preview.ts` e no app do produto. Evite Google Fonts via `<link>`: expõe o IP do usuário a terceiros.
- **Radius sob medida:** além de `--radius-scale`, sobrescreva os semânticos: `--radius-control` (botões/campos), `--radius-control-sm`, `--radius-card`, `--radius-overlay`, `--radius-pill`. Não os altere se o projeto não definir estilo de arredondamento.

## Tokens disponíveis (em `tokens.css`)

- **Cor semântica:** `--color-text-*`, `--color-bg-*`, `--color-border-*`, `--color-action-*` (+ `-hover`, `-pressed`), `--color-on-action-*`, `--color-status-*-bg/fg`, `--color-nav-*`, `--color-overlay`. Tema escuro em `[data-theme="dark"]`.
- **Escalas cruas:** `--color-brand-*`, `--color-secondary-*`, `--color-gray-*`, `--color-red/green/blue/yellow/orange/indigo/violet/pink-*`. Componentes preferem os semânticos.
- **Tipografia:** `--font-size-*`, `--font-weight-*` (use os semânticos `heading/button/label/body/caption`), `--line-height-*`, `--letter-spacing-*`. **Estilos de texto** (iguais aos do Figma): `--text-heading-*`, `--text-subtitle-*`, `--text-body-*`, `--text-caption-*`, `--text-button-*`, cada um com `-tracking`. Uso: `font: var(--text-body-s); letter-spacing: var(--text-body-s-tracking);` (ver `Foundations/Typography`).
- **Espaçamento:** `--spacing-2xs … 4xl`. **Controles:** `--control-*` (`--control-height-md` = 44px, altura do `Button` padrão, com texto em `--font-size-base` = 16px).
- **Ajustes do projeto:** `src/tokens/overrides.css` (carregado depois de `tokens.css`) sobrescreve tokens da Base sem editá-la. Hoje: barra de rolagem com thumb de 4px e faixa de 24px nos dois eixos.
- **Barra de rolagem:** `--scrollbar-size-x` (horizontal, 24px de área de toque), `--scrollbar-size-y` (vertical, 16px), `--scrollbar-thickness` (8px visível), `--scrollbar-thumb(-hover)`. Aplicada globalmente a todo elemento com rolagem (ver `Foundations/Scrollbar`); não crie scrollbar por componente.
- **Superfícies e bordas:** `--color-bg-raised` (Dialog, menus, calendário, Popover), `--color-border-card` (contorno de Card/tabela), `--color-text-placeholder`, `--color-action-outline-*` (Button `outline`), `--color-on-action-primary-hover/pressed`, `--color-nav-text-muted`, `--color-nav-active-text`.
- **Forma:** `--radius-*`, `--border-width-*`, `--shadow-*`, `--opacity-*`, `--transition-*`.
- **Foco:** `--focus-ring-*`, `--focus-glow`, `--focus-glow-error`.
- **Camadas:** `--z-dropdown/sticky/overlay/toast/tooltip`.
- **Breakpoints:** `--breakpoint-sm/md/lg/xl` (640/768/1024/1280) e `breakpoints.ts`. Media queries não aceitam `var()`; escreva `@media (min-width: 768px)` com o valor literal.

## Regras

1. Nunca escreva `#hex`, `rgb()`, `font-family`, `font-size` ou `border-radius` em px em CSS/TSX de componentes ou páginas. Use tokens.
2. Precisa de uma cor/medida que não existe? Adicione um **token semântico** em `tokens.css` (na Base) — não um valor local.
3. `npm run check:tokens` valida isso (falha o build de CI se houver valor fixo). Exceção pontual: comentário `token-ok` na linha.

## Como validar uma nova identidade

1. Edite `brand.css`; rode `npm run storybook`.
2. Confira `Foundations/Colors`, `Typography` e `Border Radius`, alterne claro/escuro e abra a aba **Accessibility** das stories principais (contraste).
3. Rode `npm run check:tokens`.

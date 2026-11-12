import { ReactNode } from 'react';
import { ChevronsUpDown, ChevronUp, ChevronDown, Inbox, SearchX } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar';
import { Badge, BadgeStatus } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { EmptyState, EmptyStateProps } from '../EmptyState/EmptyState';
import { Pagination, PaginationProps } from '../Pagination/Pagination';
import { Spinner } from '../Spinner/Spinner';
import { Toggle } from '../Toggle/Toggle';
import { cx } from '../../utils/cx';
import styles from './Table.module.css';

/* ── Types ─────────────────────────────────────────────────────────────── */

export type StatusType = BadgeStatus;

export type ActionItem<T> = {
  icon: ReactNode;
  label: string;
  onClick: (row: T) => void;
  danger?: boolean;
};

export type TableColumn<T> = {
  key: keyof T;
  /** Texto do cabeçalho; também é o nome acessível da coluna quando há `headerContent`. */
  label: string;
  /**
   * Conteúdo do cabeçalho no lugar do texto (ex.: `Checkbox` de "selecionar todos").
   * `label` continua sendo o nome acessível. Ignorado em colunas `sortable`.
   */
  headerContent?: ReactNode;
  sortable?: boolean;
  /** Largura da coluna; também é a largura mínima (quando não cabe, a tabela rola na horizontal). */
  width?: string | number;
  align?: 'left' | 'center' | 'right';

  /** Custom render always takes priority over `type`. */
  render?: (value: unknown, row: T) => ReactNode;

  /**
   * 'text' (default) | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions'.
   * Regra: a coluna `actions` é sempre a última e fica fixa à direita; só as demais colunas rolam
   * na horizontal. Use uma única coluna `actions` por tabela.
   */
  type?: 'text' | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions';

  /** type='badge': mapeia o valor da célula → { label, status } */
  statusMap?: Record<string, { label: string; status: StatusType }>;
  /** type='toggle': chamado quando o interruptor muda */
  onToggle?: (row: T, value: boolean) => void;
  /** type='actions': botões de ícone exibidos na célula */
  actionItems?: ActionItem<T>[];
  /** type='link': monta o href a partir da linha */
  getHref?: (row: T) => string;
  /** type='link': chamado ao clicar (cancela a navegação padrão) */
  onLinkClick?: (row: T) => void;
  /** type='avatar': coluna cujo valor é o nome exibido/iniciais (padrão: o próprio valor da célula) */
  nameKey?: keyof T;
  /**
   * Fixa a coluna na borda direita durante a rolagem horizontal (o restante rola por baixo).
   * `type: 'actions'` já assume `'right'`; use `sticky: 'right'` em colunas de ações com `render`
   * próprio. Colunas fixas são movidas para o fim, na ordem recebida.
   */
  sticky?: 'right';
};

const isStickyRight = <T,>(col: TableColumn<T>) => col.sticky === 'right' || col.type === 'actions';

export type TablePagination = {
  /** Página atual (começa em 1). */
  page: number;
  /** Quantidade de linhas por página. */
  pageSize: number;
  /** Total de registros (todas as páginas). */
  total: number;
  onPageChange: (page: number) => void;
  /** Texto do intervalo (i18n). Padrão: "Mostrando 1–10 de 42". */
  rangeLabel?: (from: number, to: number, total: number) => string;
  /** Textos do `Pagination` (i18n). */
  labels?: PaginationProps['labels'];
};

export type TableProps<T extends Record<string, unknown>> = {
  title?: string;
  subtitle?: string;
  /** Nome acessível da tabela quando não há `title`. */
  caption?: string;
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  /**
   * Por que a tabela está vazia (só vale quando `rows` está vazio):
   * - `'no-records'`: o módulo ainda não tem cadastros. Use o ícone do módulo em `empty.icon`,
   *   um título contextual ("Nenhum equipamento cadastrado"), a orientação em `empty.description`
   *   e o botão de criação em `empty.action`. Busca e filtros (`toolbar`) ficam visíveis, mas
   *   desabilitados, e a ordenação do cabeçalho é desativada: não há o que buscar nem ordenar.
   * - `'no-results'` (padrão): busca/filtros não retornaram registros. Ícone fixo (lupa), textos
   *   padrão e, com `onClearFilters`, o botão para limpar busca e filtros.
   */
  emptyVariant?: 'no-records' | 'no-results';
  /** Sobrescreve título, descrição, ícone ou ação do estado vazio. */
  empty?: Partial<EmptyStateProps>;
  /** `emptyVariant="no-results"`: limpa busca e filtros (exibe o botão de ação do estado vazio). */
  onClearFilters?: () => void;
  /** Textos padrão dos estados vazios (i18n). */
  emptyLabels?: {
    noResultsTitle?: string;
    noResultsDescription?: string;
    clearFilters?: string;
  };
  loadingLabel?: string;
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDir?: 'asc' | 'desc';
  /**
   * Paginação no rodapé da tabela (dentro do Card): "Mostrando X–Y de Z" à esquerda e
   * `Pagination` à direita. `rows` deve conter só as linhas da página atual.
   */
  pagination?: TablePagination;
  /**
   * Busca e filtros da tabela, dentro do Card (entre o título e o cabeçalho das colunas).
   * Use os componentes do DS (`Input type="search"`, `Dropdown`…), sempre com nome acessível.
   * O primeiro item ocupa o espaço livre; os demais quebram linha em telas estreitas.
   */
  toolbar?: ReactNode;
  /** Ações no cabeçalho do Card, no lado oposto ao título (ex.: exportar, escolher colunas). */
  actions?: ReactNode;
};

const defaultRange = (from: number, to: number, total: number) => `Mostrando ${from}-${to} de ${total}`;

/* ── Cell renderer ──────────────────────────────────────────────────────── */

function renderCell<T extends Record<string, unknown>>(col: TableColumn<T>, row: T): ReactNode {
  const value = row[col.key];

  if (col.render) return col.render(value, row);

  switch (col.type) {
    case 'badge': {
      const s = col.statusMap?.[String(value)];
      return s ? <Badge status={s.status} dot>{s.label}</Badge> : String(value ?? '');
    }

    case 'link':
      return (
        <a
          href={col.getHref ? col.getHref(row) : '#'}
          className={styles.cellLink}
          onClick={e => {
            if (col.onLinkClick) { e.preventDefault(); col.onLinkClick(row); }
          }}
        >
          {String(value ?? '')}
        </a>
      );

    case 'avatar':
      return <Avatar size="sm" src={String(value ?? '')} name={String(col.nameKey ? row[col.nameKey] : col.label)} />;

    case 'toggle':
      return (
        <Toggle
          size="sm"
          aria-label={col.label}
          checked={Boolean(value)}
          onChange={e => col.onToggle?.(row, e.target.checked)}
        />
      );

    case 'actions':
      return (
        <div className={styles.cellActions}>
          {col.actionItems?.map((action, i) => (
            <button
              key={i}
              className={cx(styles.actionBtn, action.danger && styles.actionDanger)}
              onClick={() => action.onClick(row)}
              title={action.label}
              aria-label={action.label}
              type="button"
            >
              {action.icon}
            </button>
          ))}
        </div>
      );

    default:
      return String(value ?? '');
  }
}

/* ── Footer (paginação) ─────────────────────────────────────────────────── */

function TableFooter({ page, pageSize, total, onPageChange, rangeLabel = defaultRange, labels }: TablePagination) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className={styles.footer}>
      <span className={styles.range} aria-live="polite">{rangeLabel(from, to, total)}</span>
      {pageCount > 1 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} labels={labels} />
      )}
    </div>
  );
}

/* ── Table ──────────────────────────────────────────────────────────────── */

/**
 * Tabela de dados dentro de um Card. Configure por colunas (`type`: text, link, badge,
 * avatar, toggle, actions) em vez de criar tabelas novas. Ordenação é controlada pelo pai.
 * A coluna de ações (e qualquer coluna `sticky: 'right'`) é movida para o fim e fica fixa
 * à direita durante a rolagem horizontal. Busca/filtros vão em `toolbar`; paginação em `pagination`.
 */
export function Table<T extends Record<string, unknown>>({
  title,
  subtitle,
  caption,
  columns: columnsProp,
  rows,
  loading,
  emptyVariant = 'no-results',
  empty,
  onClearFilters,
  emptyLabels,
  loadingLabel = 'Carregando',
  onSort,
  sortKey,
  sortDir,
  pagination,
  toolbar,
  actions,
}: TableProps<T>) {
  // Colunas fixas (ações) sempre por último; as demais mantêm a ordem recebida.
  const columns = [
    ...columnsProp.filter(col => !isStickyRight(col)),
    ...columnsProp.filter(col => isStickyRight(col)),
  ];

  const isEmpty = !loading && rows.length === 0;
  const noRecords = isEmpty && emptyVariant === 'no-records';
  // Sem linhas, ordenar não tem efeito: o cabeçalho mostra só os labels.
  const canSort = (col: TableColumn<T>) => Boolean(col.sortable) && !isEmpty;

  const emptyState: EmptyStateProps = noRecords
    ? { icon: <Inbox size={40} />, title: 'Nenhum registro cadastrado', ...empty }
    : {
        title: emptyLabels?.noResultsTitle ?? 'Nenhum resultado encontrado',
        description: emptyLabels?.noResultsDescription ?? 'Tente outros termos de busca ou ajuste os filtros.',
        action: onClearFilters && (
          <Button variant="secondary" onClick={onClearFilters}>
            {emptyLabels?.clearFilters ?? 'Limpar busca e filtros'}
          </Button>
        ),
        ...empty,
        // O ícone de "sem resultados" é sempre o mesmo, independente do módulo.
        icon: <SearchX size={40} />,
      };

  const ariaSort = (col: TableColumn<T>): 'ascending' | 'descending' | 'none' | undefined => {
    if (!canSort(col)) return undefined;
    if (sortKey !== col.key) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <Card title={title} subtitle={subtitle} actions={actions} padding="none">
      {toolbar && (
        // Sem cadastros, busca e filtros não têm o que filtrar: ficam visíveis (mesma estrutura)
        // porém desabilitados. O <fieldset disabled> desabilita todos os controles nativos dentro dele.
        <fieldset className={styles.toolbar} disabled={noRecords}>{toolbar}</fieldset>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {caption && <caption className={styles.srOnly}>{caption}</caption>}
          <thead>
            <tr className={styles.headerRow}>
              {columns.map((col, ci) => (
                <th
                  key={`${String(col.key)}-${ci}`}
                  scope="col"
                  className={cx(styles.th, isStickyRight(col) && styles.stickyRight)}
                  style={{ width: col.width ?? undefined, minWidth: col.width ?? undefined, textAlign: col.align ?? 'left' }}
                  aria-sort={ariaSort(col)}
                  aria-label={!canSort(col) && col.headerContent ? col.label : undefined}
                >
                  {canSort(col) ? (
                    <button type="button" className={styles.sortBtn} onClick={() => onSort?.(col.key)}>
                      {col.label}
                      <span className={styles.sortIcon} aria-hidden="true">
                        {sortKey === col.key
                          ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          : <ChevronsUpDown size={12} />}
                      </span>
                    </button>
                  ) : (col.headerContent ?? col.label)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.stateCell}>
                  <Spinner size="sm" label={loadingLabel} />
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {/* "Sem resultados" é anunciado ao leitor de tela quando a busca/filtro muda */}
                  <div className={styles.emptyArea} role={noRecords ? undefined : 'status'}>
                    <EmptyState {...emptyState} />
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  {columns.map((col, ci) => (
                    <td
                      key={`${String(col.key)}-${ci}`}
                      className={cx(
                        styles.td,
                        col.type === 'actions' && styles.tdActions,
                        isStickyRight(col) && styles.stickyRight,
                      )}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.total > 0 && <TableFooter {...pagination} />}
    </Card>
  );
}

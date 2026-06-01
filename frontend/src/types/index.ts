// ── API Response Types ─────────────────────────────────────────────────────────

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  exec_ms: number;
  truncated: boolean;
}

export interface PipelineResponse {
  question: string;
  sql: string;
  explanation: string;
  result: QueryResult | null;
  history_id: number | null;
  warnings: string[];
  auto_corrected: boolean;
}

export interface GenerateResponse {
  sql: string;
  explanation: string;
}

export interface HistoryItem {
  id: number;
  question: string;
  sql: string;
  explanation: string | null;
  row_count: number | null;
  exec_ms: number | null;
  status: 'success' | 'error';
  error_msg: string | null;
  created_at: string;
}

export interface HistoryList {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  is_primary_key: boolean;
}

export interface TableSchema {
  columns: SchemaColumn[];
  foreign_keys: { from_column: string; to_table: string; to_column: string }[];
}

export type DBSchema = Record<string, TableSchema>;

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── App State ─────────────────────────────────────────────────────────────────

export type AppView = 'query' | 'history' | 'schema';

export interface QueryState {
  question: string;
  generatedSql: string | null;
  explanation: string | null;
  result: QueryResult | null;
  isLoading: boolean;
  error: string | null;
  warnings: string[];
  autoCorrect: boolean;
  autoExecute: boolean;
}

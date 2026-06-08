import axios, { AxiosError } from 'axios';
import type {
  DBSchema,
  GenerateResponse,
  HistoryList,
  PipelineResponse,
  ValidationResult,
} from '../types';

console.log('API URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptors ───────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const detail = (error.response?.data as any)?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.message ?? error.message ?? 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

// ── Query endpoints ────────────────────────────────────────────────────────────

export const queryApi = {
  /** Full pipeline: NL → SQL → execute */
  run: async (question: string, autoExecute = true): Promise<PipelineResponse> => {
    const { data } = await api.post('/queries/run', { question, auto_execute: autoExecute });
    return data;
  },

  /** Generate SQL only (no execution) */
  generate: async (question: string): Promise<GenerateResponse> => {
    const { data } = await api.post('/queries/generate', { question });
    return data;
  },

  /** Execute a provided SQL string */
  execute: async (sql: string, question?: string): Promise<PipelineResponse> => {
    const { data } = await api.post('/queries/execute', {
      sql,
      question,
      save_to_history: true,
    });
    return data;
  },

  /** Validate SQL safety without executing */
  validate: async (sql: string): Promise<ValidationResult> => {
    const { data } = await api.post('/queries/validate', { sql });
    return data;
  },
};

// ── History endpoints ──────────────────────────────────────────────────────────

export const historyApi = {
  list: async (limit = 20, offset = 0): Promise<HistoryList> => {
    const { data } = await api.get('/queries/history', { params: { limit, offset } });
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/queries/history/${id}`);
  },
};

// ── Schema endpoint ────────────────────────────────────────────────────────────

export const schemaApi = {
  get: async (): Promise<{ schema: DBSchema; table_count: number }> => {
    const { data } = await api.get('/schema');
    return data;
  },
};

export default api;

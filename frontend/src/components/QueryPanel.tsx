import { useRef, useState, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowRight, Sparkles, RotateCcw, Play, Copy,
  CheckCircle, AlertTriangle, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { queryApi } from '../services/api';
import type { PipelineResponse, QueryResult } from '../types';
import ResultTable from './ResultTable';
import SqlPreview from './SqlPreview';
import ExamplePrompts from './ExamplePrompts';

const PLACEHOLDER = 'Ask anything about your data…\n\nTry: "Show top 5 users by total order value last month"';

export default function QueryPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sqlExpanded, setSqlExpanded] = useState(true);
  const [autoExecute, setAutoExecute] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = question.trim().length >= 3 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await queryApi.run(question.trim(), autoExecute);
      setResponse(res);
      if (res.auto_corrected) {
        toast('Query auto-corrected by AI ✨', { icon: '🔧' });
      }
      if (res.warnings.length > 0) {
        toast.error(`Warning: ${res.warnings[0]}`, { duration: 5000 });
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const handleCopySql = () => {
    if (response?.sql) {
      navigator.clipboard.writeText(response.sql);
      toast.success('SQL copied!');
    }
  };

  const handleRerunSql = async () => {
    if (!response?.sql) return;
    setLoading(true);
    setError(null);
    try {
      const res = await queryApi.execute(response.sql, question);
      setResponse((prev) => prev ? { ...prev, result: res.result } : prev);
      toast.success('Query re-executed');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="query-panel">
      {/* Header */}
      <div className="panel-header">
        <h1 className="panel-title">
          <Sparkles size={20} className="title-icon" />
          AI Query Builder
        </h1>
        <p className="panel-subtitle">
          Ask questions in plain English — get SQL and results instantly
        </p>
      </div>

      {/* Input area */}
      <div className="input-section">
        <div className={`input-wrapper ${loading ? 'loading' : ''}`}>
          <textarea
            ref={textareaRef}
            className="query-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER}
            rows={3}
            disabled={loading}
            spellCheck={false}
          />
          <div className="input-actions">
            <div className="input-meta">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={autoExecute}
                  onChange={(e) => setAutoExecute(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-text">Auto-execute</span>
              </label>
              <span className="shortcut-hint">⌘↵ to run</span>
            </div>
            <div className="input-buttons">
              {(response || error) && (
                <button className="btn btn-ghost" onClick={handleReset} title="Reset">
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Zap size={16} />
                    Run Query
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Example prompts shown when empty */}
        {!question && !response && !loading && (
          <ExamplePrompts onSelect={setQuestion} />
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="loading-state">
          <div className="loading-step">
            <span className="step-dot active" />
            <span>Analysing your question…</span>
          </div>
          <div className="loading-step">
            <span className="step-dot" />
            <span>Generating SQL with schema context…</span>
          </div>
          <div className="loading-step">
            <span className="step-dot" />
            <span>Executing and formatting results…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="error-card">
          <AlertTriangle size={18} className="error-icon" />
          <div className="error-content">
            <p className="error-title">Query failed</p>
            <p className="error-msg">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {response && !loading && (
        <div className="results-section">
          {/* Auto-correction badge */}
          {response.auto_corrected && (
            <div className="correction-badge">
              <Zap size={13} />
              SQL was auto-corrected by AI
            </div>
          )}

          {/* SQL Preview */}
          <div className="result-card">
            <div
              className="card-header"
              onClick={() => setSqlExpanded((v) => !v)}
              role="button"
              tabIndex={0}
            >
              <div className="card-header-left">
                <span className="card-label">Generated SQL</span>
                {response.warnings.length > 0 && (
                  <span className="badge badge-warn">
                    <AlertTriangle size={11} />
                    {response.warnings.length} warning
                  </span>
                )}
              </div>
              <div className="card-header-right">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleCopySql(); }}
                  title="Copy SQL"
                >
                  <Copy size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleRerunSql(); }}
                  title="Re-run"
                >
                  <Play size={14} />
                </button>
                {sqlExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            {sqlExpanded && <SqlPreview sql={response.sql} />}
          </div>

          {/* Explanation */}
          {response.explanation && (
            <div className="explanation-card">
              <CheckCircle size={15} className="explain-icon" />
              <p className="explanation-text">{response.explanation}</p>
            </div>
          )}

          {/* Result table */}
          {response.result && (
            <div className="result-card">
              <div className="card-header">
                <span className="card-label">Results</span>
                <div className="result-meta">
                  <span className="badge">
                    {response.result.row_count.toLocaleString()} rows
                  </span>
                  <span className="badge badge-muted">
                    {response.result.exec_ms.toFixed(1)} ms
                  </span>
                  {response.result.truncated && (
                    <span className="badge badge-warn">Truncated</span>
                  )}
                </div>
              </div>
              <ResultTable result={response.result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

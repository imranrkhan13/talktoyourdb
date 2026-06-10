// QueryPanel.tsx — with SQL file upload support
import { useRef, useState, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';
import {
  Sparkles, RotateCcw, Play, Copy, CheckCircle,
  AlertTriangle, Zap, ChevronDown, ChevronUp, Upload, FileCode, X
} from 'lucide-react';
import { queryApi } from '../services/api';
import type { PipelineResponse } from '../types';
import ResultTable from './ResultTable';
import SqlPreview from './SqlPreview';
import ExamplePrompts from './ExamplePrompts';

const PLACEHOLDER = 'Ask anything about your data…\n\nTry: "Show top 5 users by total order value last month"';

interface UploadedSchema {
  filename: string;
  content: string;
}

export default function QueryPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sqlExpanded, setSqlExpanded] = useState(true);
  const [autoExecute, setAutoExecute] = useState(true);
  const [uploadedSchema, setUploadedSchema] = useState<UploadedSchema | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = question.trim().length >= 3 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await queryApi.run(question.trim(), autoExecute);
      setResponse(res);
      if (res.auto_corrected) toast('Query auto-corrected by AI', { icon: '✦' });
      if (res.warnings.length > 0) toast.error(`Warning: ${res.warnings[0]}`, { duration: 5000 });
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(); }
  };

  const handleReset = () => {
    setQuestion(''); setResponse(null); setError(null);
    textareaRef.current?.focus();
  };

  const handleCopySql = () => {
    if (response?.sql) { navigator.clipboard.writeText(response.sql); toast.success('SQL copied!'); }
  };

  const handleRerunSql = async () => {
    if (!response?.sql) return;
    setLoading(true); setError(null);
    try {
      const res = await queryApi.execute(response.sql, question);
      setResponse(prev => prev ? { ...prev, result: res.result } : prev);
      toast.success('Re-executed');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const processFile = (file: File) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['sql', 'txt', 'ddl'].includes(ext || '')) {
      toast.error('Please upload a .sql, .ddl, or .txt file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedSchema({ filename: file.name, content });
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="query-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-row">
          <h1 className="panel-title">
            <Sparkles size={18} className="title-icon" />
            AI Query Builder
          </h1>
          <button className="upload-schema-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} strokeWidth={2} />
            Upload SQL Schema
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.ddl,.txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        <p className="panel-subtitle">Ask questions in plain English — get SQL and results instantly</p>
      </div>

      {/* Uploaded schema badge */}
      {uploadedSchema && (
        <div className="schema-upload-badge">
          <FileCode size={14} strokeWidth={2} />
          <span className="schema-upload-name">{uploadedSchema.filename}</span>
          <span className="schema-upload-hint">· Schema loaded · AI will use this context</span>
          <button className="schema-upload-remove" onClick={() => setUploadedSchema(null)}>
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Drop zone when no schema loaded */}
      {!uploadedSchema && (
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} strokeWidth={1.75} className="drop-zone-icon" />
          <span>Drop your <strong>.sql</strong> schema file here, or <span className="drop-zone-link">browse</span></span>
          <span className="drop-zone-hint">Optional — AI uses your live DB schema by default</span>
        </div>
      )}

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
                <input type="checkbox" checked={autoExecute} onChange={(e) => setAutoExecute(e.target.checked)} className="toggle-checkbox" />
                <span className="toggle-text">Auto-execute</span>
              </label>
              <span className="shortcut-hint">⌘↵ to run</span>
            </div>
            <div className="input-buttons">
              {(response || error) && (
                <button className="btn btn-ghost" onClick={handleReset} title="Reset">
                  <RotateCcw size={14} />
                </button>
              )}
              <button className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} onClick={handleSubmit} disabled={!canSubmit}>
                {loading ? <span className="spinner" /> : <><Zap size={14} /> Run Query</>}
              </button>
            </div>
          </div>
        </div>
        {!question && !response && !loading && <ExamplePrompts onSelect={setQuestion} />}
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-step"><span className="step-dot active" /><span>Analysing your question…</span></div>
          <div className="loading-step"><span className="step-dot" /><span>Generating SQL with schema context…</span></div>
          <div className="loading-step"><span className="step-dot" /><span>Executing and formatting results…</span></div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-card">
          <AlertTriangle size={16} className="error-icon" />
          <div className="error-content">
            <p className="error-title">Query failed</p>
            <p className="error-msg">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {response && !loading && (
        <div className="results-section">
          {response.auto_corrected && (
            <div className="correction-badge"><Zap size={12} /> SQL was auto-corrected by AI</div>
          )}
          <div className="result-card">
            <div className="card-header" onClick={() => setSqlExpanded(v => !v)} role="button" tabIndex={0}>
              <div className="card-header-left">
                <span className="card-label">Generated SQL</span>
                {response.warnings.length > 0 && (
                  <span className="badge badge-warn"><AlertTriangle size={10} /> {response.warnings.length} warning</span>
                )}
              </div>
              <div className="card-header-right">
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCopySql(); }} title="Copy SQL"><Copy size={13} /></button>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleRerunSql(); }} title="Re-run"><Play size={13} /></button>
                {sqlExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </div>
            {sqlExpanded && <SqlPreview sql={response.sql} />}
          </div>

          {response.explanation && (
            <div className="explanation-card">
              <CheckCircle size={14} className="explain-icon" />
              <p className="explanation-text">{response.explanation}</p>
            </div>
          )}

          {response.result && (
            <div className="result-card">
              <div className="card-header">
                <span className="card-label">Results</span>
                <div className="result-meta">
                  <span className="badge">{response.result.row_count.toLocaleString()} rows</span>
                  <span className="badge badge-muted">{response.result.exec_ms.toFixed(1)} ms</span>
                  {response.result.truncated && <span className="badge badge-warn">Truncated</span>}
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
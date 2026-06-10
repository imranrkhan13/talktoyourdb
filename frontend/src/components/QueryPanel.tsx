// QueryPanel.tsx — with SQL file upload
import { useRef, useState, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, RotateCcw, Play, Copy, CheckCircle, AlertTriangle, Zap, ChevronDown, ChevronUp, Upload, FileCode, X } from 'lucide-react';
import { queryApi } from '../services/api';
import type { PipelineResponse } from '../types';
import ResultTable from './ResultTable';
import SqlPreview from './SqlPreview';
import ExamplePrompts from './ExamplePrompts';

const PH = 'Ask anything about your data…\n\nTry: "Show top 5 users by total order value last month"';

interface UploadedSchema { filename: string; content: string; }

export default function QueryPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sqlOpen, setSqlOpen] = useState(true);
  const [autoExec, setAutoExec] = useState(true);
  const [schema, setSchema] = useState<UploadedSchema | null>(null);
  const [drag, setDrag] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canRun = question.trim().length >= 3 && !loading;

  const run = async () => {
    if (!canRun) return;
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await queryApi.run(question.trim(), autoExec);
      setResponse(res);
      if (res.auto_corrected) toast('Query auto-corrected by AI', { icon: '✦' });
      if (res.warnings.length) toast.error(`Warning: ${res.warnings[0]}`, { duration: 5000 });
    } catch (e: any) { setError(e.message ?? 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  };

  const reset = () => { setQuestion(''); setResponse(null); setError(null); taRef.current?.focus(); };

  const copySql = () => { if (response?.sql) { navigator.clipboard.writeText(response.sql); toast.success('SQL copied!'); } };

  const rerun = async () => {
    if (!response?.sql) return;
    setLoading(true); setError(null);
    try {
      const res = await queryApi.execute(response.sql, question);
      setResponse(p => p ? { ...p, result: res.result } : p);
      toast.success('Re-executed');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['sql', 'ddl', 'txt'].includes(ext ?? '')) { toast.error('Upload a .sql, .ddl, or .txt file'); return; }
    const r = new FileReader();
    r.onload = e => { setSchema({ filename: file.name, content: e.target?.result as string }); toast.success(`Loaded ${file.name}`); };
    r.readAsText(file);
  };

  return (
    <div className="query-panel">
      <div className="panel-header">
        <div className="panel-title-row">
          <h1 className="panel-title">
            <Sparkles size={18} className="title-icon" strokeWidth={1.85} />
            AI Query Builder
          </h1>
          <button className="upload-schema-btn" onClick={() => fileRef.current?.click()}>
            <Upload size={13} strokeWidth={2} /> Upload Schema
          </button>
          <input ref={fileRef} type="file" accept=".sql,.ddl,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
        <p className="panel-subtitle">Ask questions in plain English — get SQL and results instantly</p>
      </div>

      {schema ? (
        <div className="schema-upload-badge">
          <FileCode size={13} strokeWidth={2} />
          <span className="schema-upload-name">{schema.filename}</span>
          <span className="schema-upload-hint">· Schema loaded — AI will use this context</span>
          <button className="schema-upload-remove" onClick={() => setSchema(null)}><X size={12} strokeWidth={2} /></button>
        </div>
      ) : (
        <div
          className={`drop-zone ${drag ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={15} strokeWidth={1.75} className="drop-zone-icon" />
          <span>Drop your <strong>.sql</strong> schema file here, or <span className="drop-zone-link">browse</span></span>
          <span className="drop-zone-hint">Optional — AI uses your live DB schema by default</span>
        </div>
      )}

      <div className="input-section">
        <div className={`input-wrapper ${loading ? 'loading' : ''}`}>
          <textarea ref={taRef} className="query-input" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={onKey} placeholder={PH} rows={3} disabled={loading} spellCheck={false} />
          <div className="input-actions">
            <div className="input-meta">
              <label className="toggle-label">
                <input type="checkbox" checked={autoExec} onChange={e => setAutoExec(e.target.checked)} className="toggle-checkbox" />
                <span className="toggle-text">Auto-execute</span>
              </label>
              <span className="shortcut-hint">⌘↵ to run</span>
            </div>
            <div className="input-buttons">
              {(response || error) && <button className="btn btn-ghost" onClick={reset}><RotateCcw size={13} /></button>}
              <button className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} onClick={run} disabled={!canRun}>
                {loading ? <span className="spinner" /> : <><Zap size={13} /> Run Query</>}
              </button>
            </div>
          </div>
        </div>
        {!question && !response && !loading && <ExamplePrompts onSelect={setQuestion} />}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-step"><span className="step-dot active" /><span>Analysing your question…</span></div>
          <div className="loading-step"><span className="step-dot" /><span>Generating SQL with schema context…</span></div>
          <div className="loading-step"><span className="step-dot" /><span>Executing and formatting results…</span></div>
        </div>
      )}

      {error && !loading && (
        <div className="error-card">
          <AlertTriangle size={15} className="error-icon" />
          <div className="error-content">
            <p className="error-title">Query failed</p>
            <p className="error-msg">{error}</p>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="results-section">
          {response.auto_corrected && <div className="correction-badge"><Zap size={11} /> SQL auto-corrected by AI</div>}

          <div className="result-card">
            <div className="card-header" onClick={() => setSqlOpen(v => !v)} role="button" tabIndex={0}>
              <div className="card-header-left">
                <span className="card-label">Generated SQL</span>
                {response.warnings.length > 0 && <span className="badge badge-warn"><AlertTriangle size={10} /> {response.warnings.length} warning</span>}
              </div>
              <div className="card-header-right">
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); copySql(); }}><Copy size={12} /></button>
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); rerun(); }}><Play size={12} /></button>
                {sqlOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>
            {sqlOpen && <SqlPreview sql={response.sql} />}
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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, Trash2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { historyApi } from '../services/api';
import type { HistoryItem, HistoryList } from '../types';
import SqlPreview from './SqlPreview';

interface Props {
  onReuse: (question: string) => void;
}

export default function HistoryPanel({ onReuse }: Props) {
  const [data, setData] = useState<HistoryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const res = await historyApi.list(LIMIT, page * LIMIT);
      setData(res);
    } catch {
      toast.error('Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await historyApi.delete(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const relativeTime = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="history-panel">
      <div className="panel-header">
        <h1 className="panel-title">
          <Clock size={20} className="title-icon" />
          Query History
        </h1>
        <p className="panel-subtitle">Past queries and their results</p>
      </div>

      {loading && <div className="skeleton-list">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>}

      {!loading && data?.items.length === 0 && (
        <div className="empty-state">
          <Clock size={40} className="empty-icon" />
          <p>No queries yet. Run your first query!</p>
        </div>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <div className="history-list">
            {data.items.map((item: HistoryItem) => (
              <div
                key={item.id}
                className={`history-item ${expanded === item.id ? 'expanded' : ''} status-${item.status}`}
              >
                <div
                  className="history-item-header"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="history-item-left">
                    {expanded === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div>
                      <p className="history-question">{item.question}</p>
                      <div className="history-meta">
                        <span className={`status-dot ${item.status}`} />
                        <span>{relativeTime(item.created_at)}</span>
                        {item.row_count != null && <span>· {item.row_count} rows</span>}
                        {item.exec_ms != null && <span>· {item.exec_ms.toFixed(1)}ms</span>}
                      </div>
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Reuse this query"
                      onClick={(e) => { e.stopPropagation(); onReuse(item.question); }}
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-danger"
                      title="Delete"
                      onClick={(e) => handleDelete(item.id, e)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {expanded === item.id && (
                  <div className="history-item-body">
                    <SqlPreview sql={item.sql} />
                    {item.explanation && (
                      <p className="history-explanation">{item.explanation}</p>
                    )}
                    {item.error_msg && (
                      <p className="history-error">Error: {item.error_msg}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </button>
            <span className="page-info">
              {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, data.total)} of {data.total}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={(page + 1) * LIMIT >= data.total} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

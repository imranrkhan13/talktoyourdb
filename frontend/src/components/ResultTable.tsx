import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { QueryResult } from '../types';

interface Props {
  result: QueryResult;
}

const PAGE_SIZE = 25;

export default function ResultTable({ result }: Props) {
  const [page, setPage] = useState(0);

  const { columns, rows } = result;
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (columns.length === 0) {
    return <p className="empty-result">No columns returned.</p>;
  }

  const formatCell = (val: unknown): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="result-table-wrapper">
      <div className="table-scroll">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} title={col}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, ri) => (
              <tr key={ri}>
                {columns.map((col) => (
                  <td key={col} title={formatCell(row[col])}>
                    <span className="cell-value">{formatCell(row[col])}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

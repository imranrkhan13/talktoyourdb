import { useEffect, useState } from 'react';
import { Database, Key, Link, ChevronDown, ChevronRight } from 'lucide-react';
import { schemaApi } from '../services/api';
import type { DBSchema } from '../types';

export default function SchemaPanel() {
  const [schema, setSchema] = useState<DBSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    schemaApi.get()
      .then((d) => setSchema(d.schema))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (t: string) => setExpanded(expanded === t ? null : t);

  return (
    <div className="schema-panel">
      <div className="panel-header">
        <h1 className="panel-title">
          <Database size={20} className="title-icon" />
          Database Schema
        </h1>
        <p className="panel-subtitle">
          Live schema — sent to the AI for accurate query generation
        </p>
      </div>

      {loading && <div className="skeleton-list">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>}

      {!loading && schema && (
        <div className="schema-list">
          {Object.entries(schema).map(([table, meta]) => (
            <div key={table} className={`schema-table-card ${expanded === table ? 'open' : ''}`}>
              <div
                className="schema-table-header"
                onClick={() => toggle(table)}
                role="button"
                tabIndex={0}
              >
                <div className="schema-table-left">
                  {expanded === table ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="table-name">{table}</span>
                  <span className="col-count">{meta.columns.length} columns</span>
                </div>
                {meta.foreign_keys.length > 0 && (
                  <span className="fk-badge">
                    <Link size={11} /> {meta.foreign_keys.length} FK
                  </span>
                )}
              </div>

              {expanded === table && (
                <div className="schema-table-body">
                  <table className="schema-col-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Nullable</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {meta.columns.map((col) => (
                        <tr key={col.name}>
                          <td className="col-name">
                            {col.is_primary_key && <Key size={12} className="pk-icon" />}
                            {col.name}
                          </td>
                          <td><code className="col-type">{col.type}</code></td>
                          <td>{col.nullable ? <span className="nullable-yes">YES</span> : <span className="nullable-no">NO</span>}</td>
                          <td>{col.is_primary_key && <span className="badge">PK</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {meta.foreign_keys.length > 0 && (
                    <div className="fk-list">
                      <p className="fk-title">Foreign Keys</p>
                      {meta.foreign_keys.map((fk, i) => (
                        <div key={i} className="fk-row">
                          <code>{fk.from_column}</code>
                          <span className="fk-arrow">→</span>
                          <code>{fk.to_table}.{fk.to_column}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

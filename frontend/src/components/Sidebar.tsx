// Sidebar.tsx
import { Database, History, Terminal, LayoutGrid } from 'lucide-react';
import type { AppView } from '../types';

interface Props {
  view: AppView;
  onViewChange: (v: AppView) => void;
}

const NAV = [
  { id: 'query' as AppView, Icon: Terminal, label: 'Query' },
  { id: 'history' as AppView, Icon: History, label: 'History' },
  { id: 'schema' as AppView, Icon: Database, label: 'Schema' },
];

export default function Sidebar({ view, onViewChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <LayoutGrid size={16} className="logo-icon" />
        <span className="logo-text">TalkTo<span className="logo-accent">YourDB</span></span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ id, Icon, label }) => (
          <button
            key={id}
            className={`nav-item ${view === id ? 'active' : ''}`}
            onClick={() => onViewChange(id)}
          >
            <Icon size={15} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="version-tag">v1.0.0</span>
      </div>
    </aside>
  );
}
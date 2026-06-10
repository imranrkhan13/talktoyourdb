// Sidebar.tsx
import { useState } from 'react';
import { LayoutGrid, Terminal, History, Database, Menu, X } from 'lucide-react';
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
  const [open, setOpen] = useState(false);

  const handleNav = (id: AppView) => {
    onViewChange(id);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      <div className={`mobile-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <LayoutGrid size={16} className="logo-icon" strokeWidth={2} />
          <span className="logo-text">TalkTo<span className="logo-accent">YourDB</span></span>
        </div>

        <p className="sidebar-section-label">Navigation</p>

        <nav className="sidebar-nav">
          {NAV.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'active' : ''}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={15} strokeWidth={1.85} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="version-tag">v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
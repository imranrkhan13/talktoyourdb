// App.tsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import QueryPanel from './components/QueryPanel';
import HistoryPanel from './components/HistoryPanel';
import SchemaPanel from './components/SchemaPanel';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import type { AppView } from './types';

export default function App() {
  const [view, setView] = useState<AppView>('query');
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="app-root app-enter">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
          },
        }}
      />
      <Sidebar view={view} onViewChange={setView} />
      <main className="main-content">
        {view === 'query' && <QueryPanel />}
        {view === 'history' && <HistoryPanel onReuse={() => setView('query')} />}
        {view === 'schema' && <SchemaPanel />}
      </main>
    </div>
  );
}
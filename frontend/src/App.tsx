// App.tsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import QueryPanel from './components/QueryPanel';
import HistoryPanel from './components/HistoryPanel';
import SchemaPanel from './components/SchemaPanel';
import Sidebar from './components/Sidebar';
import LandingPage from './components/Landingpage';
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
            background: '#ffffff',
            color: '#0f1117',
            border: '1px solid #e0e4ec',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
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
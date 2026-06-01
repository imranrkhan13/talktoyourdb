import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('sql', sql);

interface Props {
  sql: string;
}

// Customise the theme to match our dark surface
const theme = {
  ...atomOneDark,
  hljs: {
    ...atomOneDark.hljs,
    background: 'var(--surface-3)',
    color: 'var(--text-primary)',
  },
};

export default function SqlPreview({ sql: query }: Props) {
  return (
    <div className="sql-preview">
      <SyntaxHighlighter
        language="sql"
        style={theme}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          lineHeight: '1.7',
          overflowX: 'auto',
          background: 'var(--surface-3)',
        }}
        wrapLongLines={false}
      >
        {query}
      </SyntaxHighlighter>
    </div>
  );
}

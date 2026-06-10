// SqlPreview.tsx
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
SyntaxHighlighter.registerLanguage('sql', sql);
interface Props { sql: string; }
const theme = { ...atomOneDark, hljs: { ...atomOneDark.hljs, background: '#1a1f2e', color: '#dde2ec' } };
export default function SqlPreview({ sql: q }: Props) {
  return (
    <div className="sql-preview">
      <SyntaxHighlighter language="sql" style={theme} customStyle={{ margin: 0, padding: '1rem 1.25rem', borderRadius: '0 0 9px 9px', fontSize: '13px', lineHeight: '1.7', overflowX: 'auto', background: '#1a1f2e' }} wrapLongLines={false}>
        {q}
      </SyntaxHighlighter>
    </div>
  );
}
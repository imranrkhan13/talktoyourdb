// LandingPage.tsx — Harmoniq-style light landing with real photo background
import { useEffect, useState } from 'react';
import BG_IMAGE from '../components/fella.png';
interface Props {
    onEnter: () => void;
}
<div
    style={{
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    }}
></div>
const TYPED_QUERIES = [
    'Show top 5 users by total order value',
    'Which products are low on stock?',
    'Count orders by status this week',
    'Average revenue per country',
];

export default function LandingPage({ onEnter }: Props) {
    const [typedIndex, setTypedIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

    useEffect(() => {
        const current = TYPED_QUERIES[typedIndex];
        let t: ReturnType<typeof setTimeout>;
        if (!isDeleting && typedText.length < current.length) {
            t = setTimeout(() => setTypedText(current.slice(0, typedText.length + 1)), 52);
        } else if (!isDeleting && typedText.length === current.length) {
            t = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && typedText.length > 0) {
            t = setTimeout(() => setTypedText(current.slice(0, typedText.length - 1)), 26);
        } else {
            setIsDeleting(false);
            setTypedIndex((i) => (i + 1) % TYPED_QUERIES.length);
        }
        return () => clearTimeout(t);
    }, [typedText, isDeleting, typedIndex]);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(onEnter, 600);
    };

    return (
        
        <div className={`lp-root ${mounted ? 'lp-mounted' : ''} ${exiting ? 'lp-exiting' : ''}`}>
            

            {/* ── Nav ── */}
            <nav className="lp-nav">
                <div className="lp-logo">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <rect x="1" y="1" width="8" height="8" rx="2" fill="#111" opacity="0.85" />
                        <rect x="11" y="1" width="8" height="8" rx="2" fill="#111" opacity="0.4" />
                        <rect x="1" y="11" width="8" height="8" rx="2" fill="#111" opacity="0.4" />
                        <rect x="11" y="11" width="8" height="8" rx="2" fill="#111" opacity="0.85" />
                    </svg>
                    <span className="lp-logo-text">SQL<span className="lp-logo-accent">AI</span></span>
                </div>
                <div className="lp-nav-links">
                    <span>Docs</span>
                    <span>Pricing</span>
                    <span>About</span>
                </div>
                <button className="lp-nav-cta" onClick={handleEnter}>Launch App →</button>
            </nav>

            {/* ── Hero text ── */}
            <div className="lp-hero">
                <div className="lp-badge">Plain English → SQL, instantly ✦</div>

                <h1 className="lp-headline">
                    Your Haven for<br />
                    <em>Effortless</em> Data Queries
                </h1>

                <p className="lp-sub">
                    Ask your database anything in plain English.<br />
                    Get SQL, results, and explanations — instantly.
                </p>

                {/* Typewriter */}
                <div className="lp-typewriter">
                    <span className="lp-tw-icon">›</span>
                    <span className="lp-tw-text">{typedText}</span>
                    <span className="lp-tw-cursor" />
                </div>

                <div className="lp-ctas">
                    <button className="lp-btn-primary" onClick={handleEnter}>
                        Open Query Builder
                    </button>
                    <button className="lp-btn-ghost">Watch demo ▶</button>
                </div>
            </div>

            {/* ── Photo background ── */}
            <div className="lp-photo-bg" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
                <div className="lp-photo-fade-top" />
                <div className="lp-photo-fade-bottom" />

                {/* ── Floating app window ── */}
                <div className="lp-window">
                    <div className="lp-window-bar">
                        <span className="lp-dot red" /><span className="lp-dot yellow" /><span className="lp-dot green" />
                        <div className="lp-window-tabs">
                            <span className="lp-wtab active">Query</span>
                            <span className="lp-wtab">History</span>
                            <span className="lp-wtab">Schema</span>
                        </div>
                        <div className="lp-window-search">Search or jump to… <kbd>⌘K</kbd></div>
                    </div>
                    <div className="lp-window-body">
                        <div className="lp-w-sidebar">
                            <div className="lp-w-sitem active">⚡ Query</div>
                            <div className="lp-w-sitem">🕐 History</div>
                            <div className="lp-w-sitem">🗄 Schema</div>
                        </div>
                        <div className="lp-w-main">
                            <div className="lp-w-inputbox">
                                <span className="lp-w-placeholder">Show top 5 users by total order value last month</span>
                            </div>
                            <div className="lp-w-sql">
                                <div className="lp-w-sql-line"><span className="sql-kw">SELECT</span> u.name, <span className="sql-fn">SUM</span>(o.total) <span className="sql-kw">AS</span> <span className="sql-id">revenue</span></div>
                                <div className="lp-w-sql-line"><span className="sql-kw">FROM</span> <span className="sql-id">users u</span> <span className="sql-kw">JOIN</span> <span className="sql-id">orders o</span> <span className="sql-kw">ON</span> u.id = o.user_id</div>
                                <div className="lp-w-sql-line"><span className="sql-kw">WHERE</span> o.created_at &gt;= <span className="sql-str">DATE_TRUNC</span>(<span className="sql-str">'month'</span>, <span className="sql-fn">NOW</span>())</div>
                                <div className="lp-w-sql-line"><span className="sql-kw">GROUP BY</span> u.name <span className="sql-kw">ORDER BY</span> revenue <span className="sql-kw">DESC LIMIT</span> <span className="sql-num">5</span></div>
                            </div>
                            <div className="lp-w-table">
                                <div className="lp-w-thead"><span>name</span><span>revenue</span></div>
                                <div className="lp-w-trow"><span>Alice Chen</span><span>$48,290</span></div>
                                <div className="lp-w-trow"><span>Bob Kumar</span><span>$41,150</span></div>
                                <div className="lp-w-trow"><span>Sara Lin</span><span>$38,840</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
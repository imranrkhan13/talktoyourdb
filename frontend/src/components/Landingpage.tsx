// LandingPage.tsx
import { useEffect, useState } from 'react';

interface Props {
    onEnter: () => void;
}

const BG_IMAGE = '/fella.png';

const TYPED_QUERIES = [
    'Show top 5 customers by revenue last month',
    'Which products are low on stock?',
    'List users who placed more than 3 orders',
    'Count orders grouped by status',
    'Find the highest spending customers this year',
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
            t = setTimeout(() => setTypedText(current.slice(0, typedText.length + 1)), 48);
        } else if (!isDeleting && typedText.length === current.length) {
            t = setTimeout(() => setIsDeleting(true), 2200);
        } else if (isDeleting && typedText.length > 0) {
            t = setTimeout(() => setTypedText(current.slice(0, typedText.length - 1)), 24);
        } else {
            setIsDeleting(false);
            setTypedIndex((i) => (i + 1) % TYPED_QUERIES.length);
        }
        return () => clearTimeout(t);
    }, [typedText, isDeleting, typedIndex]);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(onEnter, 580);
    };

    return (
        <div className={`lp-root ${mounted ? 'lp-mounted' : ''} ${exiting ? 'lp-exiting' : ''}`}>

            {/* Nav */}
            <nav className="lp-nav">
                <div className="lp-logo">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <rect x="1" y="1" width="8" height="8" rx="2" fill="#111" opacity="0.85" />
                        <rect x="11" y="1" width="8" height="8" rx="2" fill="#111" opacity="0.4" />
                        <rect x="1" y="11" width="8" height="8" rx="2" fill="#111" opacity="0.4" />
                        <rect x="11" y="11" width="8" height="8" rx="2" fill="#111" opacity="0.85" />
                    </svg>
                    <span className="lp-logo-text">TalkTo<span className="lp-logo-accent">YourDB</span></span>
                </div>
                <div className="lp-nav-links">
                    <span>Docs</span>
                    <span>Security</span>
                    <span>GitHub</span>
                </div>
                <button className="lp-nav-cta" onClick={handleEnter}>Open App →</button>
            </nav>

            {/* Hero */}
            <div className="lp-hero">
                <div className="lp-badge">
                    <span className="lp-badge-dot" /> GPT-4o · PostgreSQL · Multi-layer validation
                </div>

                <h1 className="lp-headline">
                    Ask your database<br />
                    <em>anything.</em>
                </h1>

                <p className="lp-sub">
                    TalkToYourDB converts plain English into schema-aware SQL,
                    validates it through multiple security layers, and returns
                    results with AI-generated explanations — instantly.
                </p>

                {/* Typewriter */}
                <div className="lp-typewriter">
                    <span className="lp-tw-prompt">›</span>
                    <span className="lp-tw-text">{typedText}</span>
                    <span className="lp-tw-cursor" />
                </div>

                <div className="lp-ctas">
                    <button className="lp-btn-primary" onClick={handleEnter}>
                        Try it now
                    </button>
                    <div className="lp-trust-pills">
                        <span className="lp-pill">🔒 Read-only transactions</span>
                        <span className="lp-pill">⚡ Auto-repair AI</span>
                        <span className="lp-pill">🛡 Injection detection</span>
                    </div>
                </div>
            </div>

            {/* Photo + floating window */}
            <div className="lp-photo-bg" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
                <div className="lp-photo-fade-top" />
                <div className="lp-photo-fade-bottom" />

                <div className="lp-window">
                    <div className="lp-window-bar">
                        <span className="lp-dot red" />
                        <span className="lp-dot yellow" />
                        <span className="lp-dot green" />
                        <div className="lp-window-tabs">
                            <span className="lp-wtab active">Query</span>
                            <span className="lp-wtab">History</span>
                            <span className="lp-wtab">Schema</span>
                        </div>
                        <div className="lp-window-search">TalkToYourDB <kbd>⌘K</kbd></div>
                    </div>
                    <div className="lp-window-body">
                        <div className="lp-w-sidebar">
                            <div className="lp-w-sitem active">⚡ Query</div>
                            <div className="lp-w-sitem">🕐 History</div>
                            <div className="lp-w-sitem">🗄 Schema</div>
                        </div>
                        <div className="lp-w-main">
                            <div className="lp-w-inputbox">
                                <span className="lp-w-placeholder">Show top 5 customers by revenue last month</span>
                            </div>
                            <div className="lp-w-sql">
                                <div className="lp-w-sql-line">
                                    <span className="sql-kw">SELECT</span>
                                    <span className="sql-id"> users.name</span>,
                                    <span className="sql-fn"> SUM</span>(orders.total) <span className="sql-kw">AS</span> <span className="sql-id">revenue</span>
                                </div>
                                <div className="lp-w-sql-line">
                                    <span className="sql-kw">FROM</span>
                                    <span className="sql-id"> orders </span>
                                    <span className="sql-kw">JOIN</span>
                                    <span className="sql-id"> users </span>
                                    <span className="sql-kw">ON</span>
                                    <span className="sql-id"> users.id </span>= orders.user_id
                                </div>
                                <div className="lp-w-sql-line">
                                    <span className="sql-kw">WHERE</span>
                                    <span className="sql-plain"> orders.created_at &gt;= </span>
                                    <span className="sql-fn">DATE_TRUNC</span>(<span className="sql-str">'month'</span>, <span className="sql-fn">NOW</span>())
                                </div>
                                <div className="lp-w-sql-line">
                                    <span className="sql-kw">GROUP BY</span>
                                    <span className="sql-id"> users.name </span>
                                    <span className="sql-kw">ORDER BY</span>
                                    <span className="sql-id"> revenue </span>
                                    <span className="sql-kw">DESC LIMIT</span>
                                    <span className="sql-num"> 5</span>
                                </div>
                            </div>
                            <div className="lp-w-table">
                                <div className="lp-w-thead">
                                    <span>name</span><span>revenue</span><span>orders</span>
                                </div>
                                <div className="lp-w-trow"><span>Alice Chen</span><span>$48,290</span><span>142</span></div>
                                <div className="lp-w-trow"><span>Bob Kumar</span><span>$41,150</span><span>118</span></div>
                                <div className="lp-w-trow"><span>Sara Lin</span><span>$38,840</span><span>97</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
// LandingPage.tsx
import { useEffect, useState } from 'react';
import {
    Database, Zap, ShieldCheck, Clock, ArrowRight, Play
} from 'lucide-react';

interface Props {
    onEnter: () => void;
}

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
            setTypedIndex(i => (i + 1) % TYPED_QUERIES.length);
        }
        return () => clearTimeout(t);
    }, [typedText, isDeleting, typedIndex]);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(onEnter, 520);
    };

    return (
        <div className={`lp-root ${mounted ? 'lp-mounted' : ''} ${exiting ? 'lp-exiting' : ''}`}>

            {/* Full-bleed background photo */}
            <div className="lp-bg" />

            {/* Nav */}
            <nav className="lp-nav">
                <div className="lp-logo">
                    <Database size={18} strokeWidth={2} />
                    <span className="lp-logo-text">TalkTo<span className="lp-logo-accent">YourDB</span></span>
                </div>
                <div className="lp-nav-links">
                    <span>Docs</span>
                    <span>Security</span>
                    <span>GitHub</span>
                </div>
                <button className="lp-nav-cta" onClick={handleEnter}>
                    Open App <ArrowRight size={14} strokeWidth={2.5} />
                </button>
            </nav>

            {/* Hero — sits on top of photo */}
            <div className="lp-hero">
                <div className="lp-badge">
                    <span className="lp-badge-dot" />
                    GPT-4o · PostgreSQL · Multi-layer validation
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

                <div className="lp-typewriter">
                    <span className="lp-tw-prompt">
                        <ArrowRight size={13} strokeWidth={2.5} />
                    </span>
                    <span className="lp-tw-text">{typedText}</span>
                    <span className="lp-tw-cursor" />
                </div>

                <div className="lp-ctas">
                    <button className="lp-btn-primary" onClick={handleEnter}>
                        Try it now
                    </button>
                    <button className="lp-btn-ghost">
                        <Play size={13} strokeWidth={2.5} />
                        Watch demo
                    </button>
                </div>

                <div className="lp-trust-pills">
                    <span className="lp-pill">
                        <ShieldCheck size={12} strokeWidth={2} />
                        Read-only transactions
                    </span>
                    <span className="lp-pill">
                        <Zap size={12} strokeWidth={2} />
                        Auto-repair AI
                    </span>
                    <span className="lp-pill">
                        <ShieldCheck size={12} strokeWidth={2} />
                        Injection detection
                    </span>
                </div>
            </div>

            {/* Floating window — pinned to bottom */}
            <div className="lp-window-wrap">
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
                        <div className="lp-window-search">
                            TalkToYourDB <kbd>⌘K</kbd>
                        </div>
                    </div>
                    <div className="lp-window-body">
                        <div className="lp-w-sidebar">
                            <div className="lp-w-sitem active">
                                <Zap size={12} /> Query
                            </div>
                            <div className="lp-w-sitem">
                                <Clock size={12} /> History
                            </div>
                            <div className="lp-w-sitem">
                                <Database size={12} /> Schema
                            </div>
                        </div>
                        <div className="lp-w-main">
                            <div className="lp-w-inputbox">
                                Show top 5 customers by revenue last month
                            </div>
                            <div className="lp-w-sql">
                                <div className="lp-sql-line"><span className="sk">SELECT</span><span className="si"> users.name</span>, <span className="sf">SUM</span>(orders.total) <span className="sk">AS</span><span className="si"> revenue</span></div>
                                <div className="lp-sql-line"><span className="sk">FROM</span><span className="si"> orders </span><span className="sk">JOIN</span><span className="si"> users </span><span className="sk">ON</span><span className="si"> users.id</span> = orders.user_id</div>
                                <div className="lp-sql-line"><span className="sk">WHERE</span> orders.created_at &gt;= <span className="sf">DATE_TRUNC</span>(<span className="ss">'month'</span>, <span className="sf">NOW</span>())</div>
                                <div className="lp-sql-line"><span className="sk">GROUP BY</span><span className="si"> users.name </span><span className="sk">ORDER BY</span><span className="si"> revenue </span><span className="sk">DESC LIMIT</span><span className="sn"> 5</span></div>
                            </div>
                            <div className="lp-w-table">
                                <div className="lp-w-thead"><span>name</span><span>revenue</span><span>orders</span></div>
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
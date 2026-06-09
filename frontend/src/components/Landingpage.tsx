// LandingPage.tsx — Animated intro screen before entering the app
import { useEffect, useState } from 'react';

interface Props {
    onEnter: () => void;
}

const TYPED_QUERIES = [
    'Show top 5 users by order value',
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

    useEffect(() => {
        setMounted(true);
    }, []);

    // Typewriter effect
    useEffect(() => {
        const current = TYPED_QUERIES[typedIndex];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting && typedText.length < current.length) {
            timeout = setTimeout(() => setTypedText(current.slice(0, typedText.length + 1)), 55);
        } else if (!isDeleting && typedText.length === current.length) {
            timeout = setTimeout(() => setIsDeleting(true), 1800);
        } else if (isDeleting && typedText.length > 0) {
            timeout = setTimeout(() => setTypedText(current.slice(0, typedText.length - 1)), 28);
        } else if (isDeleting && typedText.length === 0) {
            setIsDeleting(false);
            setTypedIndex((i) => (i + 1) % TYPED_QUERIES.length);
        }

        return () => clearTimeout(timeout);
    }, [typedText, isDeleting, typedIndex]);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(onEnter, 650);
    };

    return (
        <div className={`landing-root ${mounted ? 'mounted' : ''} ${exiting ? 'exiting' : ''}`}>
            {/* Ambient orbs */}
            <div className="landing-orb orb-1" />
            <div className="landing-orb orb-2" />
            <div className="landing-orb orb-3" />

            {/* Subtle grid overlay */}
            <div className="landing-grid" />

            {/* Nav bar */}
            <nav className="landing-nav">
                <div className="landing-logo">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="1" y="1" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.9" />
                        <rect x="11" y="1" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.5" />
                        <rect x="1" y="11" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.5" />
                        <rect x="11" y="11" width="8" height="8" rx="2" fill="var(--accent)" opacity="0.9" />
                    </svg>
                    <span className="landing-logo-text">SQL<span className="landing-logo-accent">AI</span></span>
                </div>
                <div className="landing-nav-right">
                    <span className="landing-badge">v1.0.0</span>
                </div>
            </nav>

            {/* Hero content */}
            <main className="landing-hero">
                <div className="landing-eyebrow">
                    <span className="eyebrow-dot" />
                    Natural language → SQL, instantly
                </div>

                <h1 className="landing-headline">
                    Your database,<br />
                    <em>finally</em> speaking<br />
                    plain English
                </h1>

                <p className="landing-sub">
                    Type a question. Get SQL. See results.<br />
                    No query syntax. No guessing column names.
                </p>

                {/* Typewriter demo */}
                <div className="landing-typewriter">
                    <span className="typewriter-prompt">›</span>
                    <span className="typewriter-text">{typedText}</span>
                    <span className="typewriter-cursor" />
                </div>

                {/* CTA */}
                <div className="landing-cta">
                    <button className="landing-btn-primary" onClick={handleEnter}>
                        Open Query Builder
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <span className="landing-hint">No setup required · Live demo data</span>
                </div>
            </main>

            {/* Bottom app preview strip */}
            <div className="landing-preview-strip">
                <div className="preview-window">
                    <div className="preview-titlebar">
                        <span className="preview-dot red" />
                        <span className="preview-dot yellow" />
                        <span className="preview-dot green" />
                        <span className="preview-tab active">Query</span>
                        <span className="preview-tab">History</span>
                        <span className="preview-tab">Schema</span>
                    </div>
                    <div className="preview-body">
                        <div className="preview-line">
                            <span className="preview-kw">SELECT</span>
                            <span className="preview-id"> u.name, </span>
                            <span className="preview-fn">SUM</span>
                            <span className="preview-plain">(o.total) </span>
                            <span className="preview-kw">AS</span>
                            <span className="preview-id"> total_value</span>
                        </div>
                        <div className="preview-line">
                            <span className="preview-kw">FROM</span>
                            <span className="preview-id"> users u</span>
                            <span className="preview-kw"> JOIN</span>
                            <span className="preview-id"> orders o </span>
                            <span className="preview-kw">ON</span>
                            <span className="preview-id"> u.id = o.user_id</span>
                        </div>
                        <div className="preview-line">
                            <span className="preview-kw">WHERE</span>
                            <span className="preview-plain"> o.created_at &gt;= </span>
                            <span className="preview-str">DATE_TRUNC</span>
                            <span className="preview-plain">('month', NOW())</span>
                        </div>
                        <div className="preview-line">
                            <span className="preview-kw">ORDER BY</span>
                            <span className="preview-id"> total_value </span>
                            <span className="preview-kw">DESC</span>
                            <span className="preview-kw"> LIMIT</span>
                            <span className="preview-num"> 5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
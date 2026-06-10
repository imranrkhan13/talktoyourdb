// LandingPage.tsx
import { useEffect, useState } from 'react';
import { Database, Zap, ShieldCheck, ArrowRight, Play, Lock, RefreshCw, GitBranch, Clock } from 'lucide-react';

interface Props { onEnter: () => void; }

const QUERIES = [
    'Show top 5 customers by revenue last month',
    'Which products are low on stock?',
    'List users who placed more than 3 orders',
    'Count orders grouped by status',
    'Find highest spending customers this year',
];

const FEATURES = [
    { icon: Database, title: 'Schema-Aware Queries', desc: 'Your full database schema is sent to GPT-4o before generation — no hallucinated tables, no broken joins, no wrong relationships.' },
    { icon: ShieldCheck, title: 'Multi-Layer Validation', desc: 'Every query passes injection detection, keyword blocking, and stacked-query analysis before a single byte reaches your database.' },
    { icon: Lock, title: 'Read-Only Transactions', desc: 'All queries run inside isolated read-only transactions with timeout enforcement. Nothing can be mutated or deleted — ever.' },
    { icon: RefreshCw, title: 'Auto-Repair AI', desc: 'If a query fails, the error is fed back to GPT-4o which generates a corrected query and retries automatically.' },
    { icon: Zap, title: 'Instant Explanations', desc: 'Every result comes with a plain-English explanation of what the query does and why it was generated that way.' },
    { icon: Clock, title: 'Query History', desc: 'Every run is saved with execution time, row count, and status. Reuse, inspect, or delete any past query in one click.' },
];

export default function LandingPage({ onEnter }: Props) {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const [del, setDel] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);

    useEffect(() => {
        const cur = QUERIES[idx];
        let t: ReturnType<typeof setTimeout>;
        if (!del && text.length < cur.length) t = setTimeout(() => setText(cur.slice(0, text.length + 1)), 46);
        else if (!del && text.length === cur.length) t = setTimeout(() => setDel(true), 2400);
        else if (del && text.length > 0) t = setTimeout(() => setText(cur.slice(0, text.length - 1)), 22);
        else { setDel(false); setIdx(i => (i + 1) % QUERIES.length); }
        return () => clearTimeout(t);
    }, [text, del, idx]);

    const go = () => { setExiting(true); setTimeout(onEnter, 500); };

    return (
        <div className={`lp-page ${mounted ? 'lp-mounted' : ''} ${exiting ? 'lp-exiting' : ''}`}>

            {/* ── FIXED NAV ── */}
            <nav className="lp-nav">
                <div className="lp-logo">
                    <Database size={17} strokeWidth={2} />
                    <span className="lp-logo-text">TalkTo<span className="lp-logo-accent">YourDB</span></span>
                </div>
                <div className="lp-nav-center">
                    <span className="lp-nav-link">Docs</span>
                    <span className="lp-nav-link">Security</span>
                    <span className="lp-nav-link">GitHub</span>
                </div>
                <button className="lp-nav-cta" onClick={go}>
                    Open App <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* ── HERO — full viewport height ── */}
            <section className="lp-hero">
                <div className="lp-hero-photo" />

                <div className="lp-hero-body">
                    <div className="lp-eyebrow">
                        <span className="lp-eyebrow-dot" />
                        GPT-4o · PostgreSQL · Multi-layer validation
                    </div>

                    <h1 className="lp-h1">
                        Ask your database<br /><em>anything.</em>
                    </h1>

                    <p className="lp-hero-sub">
                        TalkToYourDB converts plain English into schema-aware SQL, validates
                        it through multiple security layers, and returns results with
                        AI-generated explanations — instantly.
                    </p>

                    <div className="lp-typewriter">
                        <span className="lp-tw-prompt"><ArrowRight size={12} strokeWidth={2.5} /></span>
                        <span className="lp-tw-text">{text}</span>
                        <span className="lp-tw-cursor" />
                    </div>

                    <div className="lp-hero-btns">
                        <button className="lp-btn-primary" onClick={go}>
                            Try it now
                        </button>
                        <button className="lp-btn-ghost">
                            <Play size={13} strokeWidth={2} /> Watch demo
                        </button>
                    </div>

                    <div className="lp-pills">
                        <span className="lp-pill"><Lock size={11} strokeWidth={2} /> Read-only transactions</span>
                        <span className="lp-pill"><Zap size={11} strokeWidth={2} /> Auto-repair AI</span>
                        <span className="lp-pill"><ShieldCheck size={11} strokeWidth={2} /> Injection detection</span>
                    </div>
                </div>

                {/* Floating dark window pinned to bottom of hero */}
                <div className="lp-window-wrap">
                    <div className="lp-window">
                        <div className="lp-wbar">
                            <span className="lp-dot r" /><span className="lp-dot y" /><span className="lp-dot g" />
                            <div className="lp-wtabs">
                                <span className="lp-wtab on">Query</span>
                                <span className="lp-wtab">History</span>
                                <span className="lp-wtab">Schema</span>
                            </div>
                            <div className="lp-wpill">TalkToYourDB <kbd>⌘K</kbd></div>
                        </div>
                        <div className="lp-wbody">
                            <div className="lp-wsidebar">
                                <div className="lp-witem on"><Zap size={11} /> Query</div>
                                <div className="lp-witem"><Clock size={11} /> History</div>
                                <div className="lp-witem"><Database size={11} /> Schema</div>
                            </div>
                            <div className="lp-wmain">
                                <div className="lp-winput">Show top 5 customers by revenue last month</div>
                                <div className="lp-wsql">
                                    <div className="lp-sql-line"><span className="sk">SELECT</span><span className="si"> users.name</span>, <span className="sf">SUM</span>(orders.total) <span className="sk">AS</span><span className="si"> revenue</span></div>
                                    <div className="lp-sql-line"><span className="sk">FROM</span><span className="si"> orders </span><span className="sk">JOIN</span><span className="si"> users </span><span className="sk">ON</span><span className="si"> users.id</span> = orders.user_id</div>
                                    <div className="lp-sql-line"><span className="sk">WHERE</span> orders.created_at &gt;= <span className="sf">DATE_TRUNC</span>(<span className="ss">'month'</span>, <span className="sf">NOW</span>())</div>
                                    <div className="lp-sql-line"><span className="sk">GROUP BY</span><span className="si"> users.name </span><span className="sk">ORDER BY</span><span className="si"> revenue </span><span className="sk">DESC LIMIT</span><span className="sn"> 5</span></div>
                                </div>
                                <div className="lp-wtable">
                                    <div className="lp-wthead"><span>name</span><span>revenue</span><span>orders</span></div>
                                    <div className="lp-wtrow"><span>Alice Chen</span><span>$48,290</span><span>142</span></div>
                                    <div className="lp-wtrow"><span>Bob Kumar</span><span>$41,150</span><span>118</span></div>
                                    <div className="lp-wtrow"><span>Sara Lin</span><span>$38,840</span><span>97</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="lp-features">
                <div className="lp-features-inner">
                    <p className="lp-section-label">What's under the hood</p>
                    <h2 className="lp-section-h2">Built for production,<br />not just demos.</h2>
                    <p className="lp-section-sub">
                        Unlike simple AI SQL generators, TalkToYourDB is designed with real-world
                        reliability, backend safety, and operational security in mind.
                    </p>
                    <div className="lp-features-grid">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div className="lp-fcard" key={title}>
                                <div className="lp-fcard-icon"><Icon size={20} strokeWidth={1.75} /></div>
                                <h3 className="lp-fcard-title">{title}</h3>
                                <p className="lp-fcard-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta">
                <h2 className="lp-cta-h2">Your database, finally<br /><em>conversational.</em></h2>
                <p className="lp-cta-sub">No SQL knowledge required. Just ask.</p>
                <button className="lp-btn-primary lp-cta-btn" onClick={go}>
                    Open Query Builder <ArrowRight size={15} strokeWidth={2} />
                </button>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <span className="lp-footer-logo">TalkToYourDB</span>
                <span className="lp-footer-copy">Built with FastAPI · PostgreSQL · GPT-4o</span>
            </footer>

        </div>
    );
}
// LandingPage.tsx — full redesign
import { useEffect, useState, useRef } from 'react';
import {
    Database, Zap, ShieldCheck, ArrowRight,
    Lock, RefreshCw, GitBranch, Clock,
    Play, CheckCircle, ChevronDown
} from 'lucide-react';

interface Props { onEnter: () => void; }

const QUERIES = [
    'Show top 5 customers by revenue last month',
    'Which products are low on stock?',
    'List users who placed more than 3 orders',
    'Count orders grouped by status',
    'Find highest spending customers this year',
];

const FEATURES = [
    { icon: Database, title: 'Schema-Aware Queries', desc: 'Your full DB schema is sent to GPT-4o before generation — no hallucinated tables, no broken joins.' },
    { icon: ShieldCheck, title: 'Multi-Layer Validation', desc: 'Injection detection, keyword blocking, stacked-query analysis — before a byte reaches your DB.' },
    { icon: Lock, title: 'Read-Only Transactions', desc: 'All queries run inside isolated read-only transactions with timeout enforcement. Nothing mutates.' },
    { icon: RefreshCw, title: 'Auto-Repair AI', desc: 'Query fails? The error feeds back to GPT-4o which corrects and retries automatically.' },
    { icon: Zap, title: 'Instant Explanations', desc: 'Every result comes with a plain-English explanation of what was generated and why.' },
    { icon: Clock, title: 'Query History', desc: 'Every run saved with execution time, row count and status. Reuse or delete in one click.' },
];

const STEPS = [
    { n: '01', title: 'Connect your database', desc: 'Point TalkToYourDB at any PostgreSQL database. Schema is read automatically.' },
    { n: '02', title: 'Ask in plain English', desc: 'Type any question about your data. No SQL knowledge required.' },
    { n: '03', title: 'Get SQL + results', desc: 'Schema-aware SQL is generated, validated, executed, and explained instantly.' },
];

export default function LandingPage({ onEnter }: Props) {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const [del, setDel] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [exit, setExit] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    // staggered entrance — wait for CSS fonts to load
    useEffect(() => { const t = setTimeout(() => setLoaded(true), 120); return () => clearTimeout(t); }, []);

    // typewriter
    useEffect(() => {
        const cur = QUERIES[idx];
        let t: ReturnType<typeof setTimeout>;
        if (!del && text.length < cur.length) t = setTimeout(() => setText(cur.slice(0, text.length + 1)), 44);
        else if (!del && text.length === cur.length) t = setTimeout(() => setDel(true), 2600);
        else if (del && text.length > 0) t = setTimeout(() => setText(cur.slice(0, text.length - 1)), 20);
        else { setDel(false); setIdx(i => (i + 1) % QUERIES.length); }
        return () => clearTimeout(t);
    }, [text, del, idx]);

    const go = () => { setExit(true); setTimeout(onEnter, 560); };

    const scrollDown = () => {
        const el = document.getElementById('lp-features');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`lp ${loaded ? 'lp-in' : ''} ${exit ? 'lp-out' : ''}`}>

            {/* ─── STICKY NAV ─── */}
            <nav className="lp-nav">
                <div className="lp-nav-logo">
                    <Database size={16} strokeWidth={2.2} className="lp-nav-icon" />
                    <span>TalkTo<strong>YourDB</strong></span>
                </div>
                <div className="lp-nav-links">
                    <a href="#lp-features">Features</a>
                    <a href="#lp-how">How it works</a>
                    <a href="#">GitHub</a>
                </div>
                <button className="lp-nav-btn" onClick={go}>
                    Open App <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* ─── HERO ─── */}
            <section className="lp-hero" ref={heroRef}>
                {/* Photo */}
                <div className="lp-hero-img" />
                {/* Gradient overlay */}
                <div className="lp-hero-grad" />

                {/* Content */}
                <div className="lp-hero-content">
                    <span className="lp-chip lp-chip-in">
                        <span className="lp-chip-dot" />
                        GPT-4o · PostgreSQL · Multi-layer validation
                    </span>

                    <h1 className="lp-h1 lp-h1-in">
                        Ask your database<br /><em>anything.</em>
                    </h1>

                    <p className="lp-hero-p lp-p-in">
                        Convert plain English into schema-aware SQL — validated,
                        executed, and explained in seconds. No SQL knowledge needed.
                    </p>

                    <div className="lp-tw-wrap lp-tw-in">
                        <span className="lp-tw-arrow"><ArrowRight size={12} strokeWidth={2.5} /></span>
                        <span className="lp-tw-text">{text}</span>
                        <span className="lp-tw-cur" />
                    </div>

                    <div className="lp-hero-btns lp-btns-in">
                        <button className="lp-cta" onClick={go}>
                            Try it free <ArrowRight size={14} strokeWidth={2.2} />
                        </button>
                        <button className="lp-ghost" onClick={scrollDown}>
                            <Play size={13} strokeWidth={2} /> See how it works
                        </button>
                    </div>

                    <div className="lp-trust lp-trust-in">
                        <span className="lp-trustpill"><Lock size={11} /> Read-only transactions</span>
                        <span className="lp-trustpill"><ShieldCheck size={11} /> Injection detection</span>
                        <span className="lp-trustpill"><Zap size={11} /> Auto-repair AI</span>
                    </div>

                    {/* Scroll hint */}
                    <button className="lp-scroll-hint lp-scroll-in" onClick={scrollDown}>
                        <ChevronDown size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Floating window — taller, full reveal */}
                <div className="lp-win-wrap lp-win-in">
                    <div className="lp-win">
                        <div className="lp-win-bar">
                            <span className="lp-d r" /><span className="lp-d y" /><span className="lp-d g" />
                            <div className="lp-win-tabs">
                                <span className="lp-wt active">Query</span>
                                <span className="lp-wt">History</span>
                                <span className="lp-wt">Schema</span>
                            </div>
                            <div className="lp-win-pill">TalkToYourDB <kbd>⌘K</kbd></div>
                        </div>
                        <div className="lp-win-body">
                            <div className="lp-win-side">
                                <div className="lp-wi active"><Zap size={11} /> Query</div>
                                <div className="lp-wi"><Clock size={11} /> History</div>
                                <div className="lp-wi"><Database size={11} /> Schema</div>
                            </div>
                            <div className="lp-win-main">
                                <div className="lp-win-q">Show top 5 customers by revenue last month</div>
                                <div className="lp-win-sql">
                                    <div className="sq"><span className="sk">SELECT</span><span className="si"> users.name</span>, <span className="sf">SUM</span>(orders.total) <span className="sk">AS</span><span className="si"> revenue</span></div>
                                    <div className="sq"><span className="sk">FROM</span><span className="si"> orders </span><span className="sk">JOIN</span><span className="si"> users </span><span className="sk">ON</span><span className="si"> users.id</span> = orders.user_id</div>
                                    <div className="sq"><span className="sk">WHERE</span> orders.created_at &gt;= <span className="sf">DATE_TRUNC</span>(<span className="ss">'month'</span>, <span className="sf">NOW</span>())</div>
                                    <div className="sq"><span className="sk">GROUP BY</span><span className="si"> users.name </span><span className="sk">ORDER BY</span><span className="si"> revenue </span><span className="sk">DESC LIMIT</span><span className="sn"> 5</span></div>
                                </div>
                                <div className="lp-win-explain">
                                    <CheckCircle size={11} className="lp-explain-icon" />
                                    Returns the top 5 customers ranked by total revenue in the current month.
                                </div>
                                <div className="lp-win-table">
                                    <div className="lp-wth"><span>name</span><span>revenue</span><span>orders</span></div>
                                    <div className="lp-wtr"><span>Alice Chen</span><span>$48,290</span><span>142</span></div>
                                    <div className="lp-wtr"><span>Bob Kumar</span><span>$41,150</span><span>118</span></div>
                                    <div className="lp-wtr"><span>Sara Lin</span><span>$38,840</span><span>97</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="lp-how" id="lp-how">
                <div className="lp-inner">
                    <p className="lp-eyebrow">How it works</p>
                    <h2 className="lp-h2">Three steps to your answer</h2>
                    <div className="lp-steps">
                        {STEPS.map((s) => (
                            <div className="lp-step" key={s.n}>
                                <span className="lp-step-n">{s.n}</span>
                                <h3 className="lp-step-title">{s.title}</h3>
                                <p className="lp-step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── VIDEO PLACEHOLDER ─── */}
            <section className="lp-video-section">
                <div className="lp-inner">
                    <p className="lp-eyebrow">See it in action</p>
                    <h2 className="lp-h2">Watch how it works</h2>
                    <div className="lp-video-box">
                        <div className="lp-video-inner">
                            <div className="lp-play-btn">
                                <Play size={28} strokeWidth={1.75} />
                            </div>
                            <p className="lp-video-label">Product walkthrough · 2 min</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="lp-features-sec" id="lp-features">
                <div className="lp-inner">
                    <p className="lp-eyebrow">Under the hood</p>
                    <h2 className="lp-h2">Built for production,<br />not just demos.</h2>
                    <p className="lp-section-p">
                        Unlike simple AI SQL generators, TalkToYourDB is designed with real-world
                        reliability, backend safety, and operational security in mind.
                    </p>
                    <div className="lp-feat-grid">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div className="lp-feat" key={title}>
                                <div className="lp-feat-ico"><Icon size={19} strokeWidth={1.75} /></div>
                                <h3 className="lp-feat-title">{title}</h3>
                                <p className="lp-feat-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─── */}
            <section className="lp-final">
                <div className="lp-inner lp-final-inner">
                    <h2 className="lp-final-h2">Your database,<br />finally <em>conversational.</em></h2>
                    <p className="lp-final-p">No SQL knowledge needed. Just ask.</p>
                    <button className="lp-cta lp-final-btn" onClick={go}>
                        Open Query Builder <ArrowRight size={15} strokeWidth={2} />
                    </button>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="lp-footer">
                <span className="lp-footer-logo">TalkToYourDB</span>
                <span className="lp-footer-copy">FastAPI · PostgreSQL · GPT-4o</span>
            </footer>

        </div>
    );
}
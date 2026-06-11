// LandingPage.tsx — light, minimal, clean
import { useEffect, useState, useRef } from 'react';
import { Database, Zap, ShieldCheck, ArrowRight, Lock, RefreshCw, Clock, ChevronDown } from 'lucide-react';

interface Props { onEnter: () => void; }

const QUERIES = [
    'Show top 5 customers by revenue last month',
    'Which products are low on stock?',
    'List users who placed more than 3 orders',
    'Count orders grouped by status',
];

const FEATURES = [
    { icon: Database, title: 'Schema-Aware Queries', desc: 'Full DB schema sent to GPT-4o before every query. Zero hallucinated tables or broken joins.' },
    { icon: ShieldCheck, title: 'Multi-Layer Validation', desc: 'Injection detection, keyword blocking, and stacked-query analysis on every request.' },
    { icon: Lock, title: 'Read-Only Always', desc: 'Isolated read-only transactions with timeout enforcement. Nothing ever mutates.' },
    { icon: RefreshCw, title: 'Auto-Repair AI', desc: 'Query fails? Error feeds back to GPT-4o, corrected and retried automatically.' },
    { icon: Zap, title: 'Instant Explanations', desc: 'SQL generated, validated, executed and explained in plain English, instantly.' },
    { icon: Clock, title: 'Full Query History', desc: 'Every run saved with timing, row count, and status. Reuse in one click.' },
];

export default function LandingPage({ onEnter }: Props) {
    const [qi, setQi] = useState(0);
    const [txt, setTxt] = useState('');
    const [del, setDel] = useState(false);
    const [visible, setVisible] = useState(false);
    const [out, setOut] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

    useEffect(() => {
        const q = QUERIES[qi];
        let t: ReturnType<typeof setTimeout>;
        if (!del && txt.length < q.length) t = setTimeout(() => setTxt(q.slice(0, txt.length + 1)), 44);
        else if (!del && txt.length === q.length) t = setTimeout(() => setDel(true), 2600);
        else if (del && txt.length > 0) t = setTimeout(() => setTxt(q.slice(0, txt.length - 1)), 20);
        else { setDel(false); setQi(i => (i + 1) % QUERIES.length); }
        return () => clearTimeout(t);
    }, [txt, del, qi]);

    const go = () => { setOut(true); setTimeout(onEnter, 500); };
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className={`lp ${visible ? 'lp-in' : ''} ${out ? 'lp-out' : ''}`}>

            {/* NAV */}
            <nav className="lp-nav">
                <div className="lp-brand">
                    <div className="lp-brand-mark"><Database size={14} strokeWidth={2.2} /></div>
                    <span className="lp-brand-name">TalkTo<strong>YourDB</strong></span>
                </div>
                <div className="lp-nav-links">
                    <a href="#demo">Demo</a>
                    <a href="#features">Features</a>
                    <a href="#">GitHub</a>
                </div>
                <button className="lp-nav-btn" onClick={go}>
                    Open App <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* HERO */}
            <section className="lp-hero">
                <div className="lp-hero-bg" />
                <div className="lp-hero-overlay" />

                <div className="lp-hero-body">
                    <span className="lp-eyebrow-pill">
                        <span className="lp-pill-dot" />
                        GPT-4o · PostgreSQL · Zero SQL required
                    </span>

                    <h1 className="lp-hero-h1">
                        Ask your database<br /><em>anything.</em>
                    </h1>

                    <p className="lp-hero-p">
                        Plain English in. Schema-aware SQL, safe execution,
                        and AI explanations out — in under a second.
                    </p>

                    <div className="lp-tw">
                        <span className="lp-tw-icon"><ArrowRight size={12} strokeWidth={2.5} /></span>
                        <span className="lp-tw-text">{txt}</span>
                        <span className="lp-tw-cur" />
                    </div>

                    <div className="lp-hero-btns">
                        <button className="lp-btn-primary" onClick={go}>
                            Try it free <ArrowRight size={14} strokeWidth={2.2} />
                        </button>
                        <button className="lp-btn-outline" onClick={() => scrollTo('demo')}>
                            Watch demo
                        </button>
                    </div>

                    <div className="lp-hero-meta">
                        <span><Lock size={11} /> Read-only</span>
                        <span><ShieldCheck size={11} /> Injection-safe</span>
                        <span><Zap size={11} /> Auto-repair</span>
                    </div>
                </div>

                {/* App window — fully visible, bleeds into next section */}
                <div className="lp-win-outer">
                    <div className="lp-win">
                        <div className="lp-win-titlebar">
                            <span className="lp-dot-r" /><span className="lp-dot-y" /><span className="lp-dot-g" />
                            <div className="lp-win-tabs">
                                <span className="lp-tab on">Query</span>
                                <span className="lp-tab">History</span>
                                <span className="lp-tab">Schema</span>
                            </div>
                            <span className="lp-win-pill">TalkToYourDB <kbd>⌘K</kbd></span>
                        </div>
                        <div className="lp-win-body">
                            <div className="lp-win-sidebar">
                                <span className="lp-sitem on"><Zap size={11} /> Query</span>
                                <span className="lp-sitem"><Clock size={11} /> History</span>
                                <span className="lp-sitem"><Database size={11} /> Schema</span>
                            </div>
                            <div className="lp-win-content">
                                <div className="lp-win-input">Show top 5 customers by revenue last month</div>
                                <div className="lp-win-sql">
                                    <div className="lq"><span className="sk">SELECT</span><span className="si"> users.name</span>, <span className="sf">SUM</span>(orders.total) <span className="sk">AS</span><span className="si"> revenue</span></div>
                                    <div className="lq"><span className="sk">FROM</span><span className="si"> orders </span><span className="sk">JOIN</span><span className="si"> users </span><span className="sk">ON</span><span className="si"> users.id</span> = orders.user_id</div>
                                    <div className="lq"><span className="sk">WHERE</span> orders.created_at &gt;= <span className="sf">DATE_TRUNC</span>(<span className="ss">'month'</span>, <span className="sf">NOW</span>())</div>
                                    <div className="lq"><span className="sk">GROUP BY</span><span className="si"> users.name </span><span className="sk">ORDER BY</span><span className="si"> revenue </span><span className="sk">DESC LIMIT</span><span className="sn"> 5</span></div>
                                </div>
                                <div className="lp-win-explain">Returns the top 5 customers ranked by total revenue in the current month.</div>
                                <div className="lp-win-table">
                                    <div className="lp-th"><span>name</span><span>revenue</span><span>orders</span></div>
                                    <div className="lp-tr"><span>Alice Chen</span><span>$48,290</span><span>142</span></div>
                                    <div className="lp-tr"><span>Bob Kumar</span><span>$41,150</span><span>118</span></div>
                                    <div className="lp-tr"><span>Sara Lin</span><span>$38,840</span><span>97</span></div>
                                    <div className="lp-tr"><span>James Park</span><span>$31,220</span><span>84</span></div>
                                </div>
                                <div className="lp-win-statusbar">
                                    <span className="lp-status-dot" />
                                    4 rows · 11.2ms · read-only transaction
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="lp-chevron" onClick={() => scrollTo('demo')}>
                    <ChevronDown size={18} strokeWidth={1.5} />
                </button>
            </section>

            {/* VIDEO */}
            <section className="lp-video-sec" id="demo">
                <div className="lp-section-inner">
                    <p className="lp-tag">See it in action</p>
                    <h2 className="lp-h2">From question to results<br />in under a second.</h2>
                    <div className="lp-video-wrap">
                        <div className="lp-video-chrome">
                            <div className="lp-vcbar">
                                <span className="lp-vd r" /><span className="lp-vd y" /><span className="lp-vd g" />
                                <span className="lp-vc-title">TalkToYourDB — AI Query Builder</span>
                            </div>
                            <video className="lp-video" src="/aisql.mp4" autoPlay muted loop playsInline />
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="lp-feat-sec" id="features">
                <div className="lp-section-inner">
                    <p className="lp-tag">Under the hood</p>
                    <h2 className="lp-h2">Production-grade,<br />not a toy wrapper.</h2>
                    <div className="lp-feat-grid">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div className="lp-feat" key={title}>
                                <div className="lp-feat-ico"><Icon size={18} strokeWidth={1.75} /></div>
                                <h3 className="lp-feat-title">{title}</h3>
                                <p className="lp-feat-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="lp-cta-sec">
                <div className="lp-section-inner lp-cta-inner">
                    <h2 className="lp-cta-h2">Your database,<br />finally <em>conversational.</em></h2>
                    <p className="lp-cta-p">No SQL knowledge needed. Just ask.</p>
                    <button className="lp-btn-primary lp-cta-btn" onClick={go}>
                        Open Query Builder <ArrowRight size={15} strokeWidth={2} />
                    </button>
                </div>
            </section>

            <footer className="lp-footer">
                <span className="lp-footer-name">TalkToYourDB</span>
                <span className="lp-footer-info">FastAPI · PostgreSQL · GPT-4o</span>
            </footer>
        </div>
    );
}
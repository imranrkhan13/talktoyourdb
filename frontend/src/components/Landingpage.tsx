import { useEffect, useRef, useState, useCallback } from 'react';
import {
    ArrowRight, Database, Shield, Zap, RefreshCw,
    Lock, BarChart2, Terminal, ChevronDown,
    CheckCircle, GitBranch, Server, Layers, AlertTriangle
} from 'lucide-react';

interface Props { onEnter: () => void; }

// ── Intersection-observer hook ──────────────────────────────────
function useReveal(rootMargin = '0px 0px -80px 0px') {
    useEffect(() => {
        const io = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('rv'); io.unobserve(e.target); }
            }),
            { rootMargin }
        );
        document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));
        return () => io.disconnect();
    }, [rootMargin]);
}

// ── Animated SQL pipeline ───────────────────────────────────────
const PIPELINE_STEPS = [
    { label: 'Natural Language', color: '#4A9EE2', icon: Terminal, text: '"Show top 5 customers by revenue"' },
    { label: 'Schema Analysis', color: '#10B981', icon: Database, text: 'Reading 12 tables, 84 columns…' },
    { label: 'SQL Generation', color: '#4A9EE2', icon: Zap, text: 'SELECT users.name, SUM(orders.total)…' },
    { label: 'Validation', color: '#10B981', icon: Shield, text: '7 security checks passed ✓' },
    { label: 'Execution', color: '#4A9EE2', icon: Server, text: '5 rows · 12.4ms · read-only' },
];

function SqlPipeline() {
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActive(a => {
                const next = (a + 1) % PIPELINE_STEPS.length;
                setProgress(0);
                return next;
            });
        }, 2200);
        const prog = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 44);
        return () => { clearInterval(interval); clearInterval(prog); };
    }, []);

    return (
        <div className="pipeline">
            {PIPELINE_STEPS.map(({ label, color, icon: Icon, text }, i) => (
                <div key={label} className={`pipeline-step ${i === active ? 'pipeline-active' : i < active ? 'pipeline-done' : ''}`}>
                    <div className="pipeline-dot" style={{ background: i <= active ? color : undefined }} />
                    {i < PIPELINE_STEPS.length - 1 && (
                        <div className="pipeline-line">
                            <div className="pipeline-line-fill" style={{ height: i < active ? '100%' : i === active ? `${progress}%` : '0%', background: color }} />
                        </div>
                    )}
                    <div className="pipeline-content">
                        <div className="pipeline-label">
                            <Icon size={12} strokeWidth={2} />
                            {label}
                        </div>
                        <div className="pipeline-text" style={{ opacity: i === active ? 1 : i < active ? 0.45 : 0.2 }}>
                            {text}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Animated validation demo ────────────────────────────────────
const CHECKS = [
    { id: 'read-only', label: 'SELECT-only enforcement', pass: true },
    { id: 'injection', label: 'SQL injection heuristics', pass: true },
    { id: 'stacked', label: 'Stacked query detection', pass: true },
    { id: 'keywords', label: 'Dangerous keyword blocking', pass: true },
    { id: 'normalize', label: 'Query normalization', pass: true },
    { id: 'timeout', label: 'Execution timeout (30s)', pass: true },
    { id: 'drop', label: 'DROP TABLE attempt', pass: false, blocked: true },
];

function ValidationDemo() {
    const [visible, setVisible] = useState(0);
    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            i++;
            setVisible(v => Math.min(v + 1, CHECKS.length));
            if (i >= CHECKS.length) { clearInterval(t); setTimeout(() => setVisible(0), 2800); }
        }, 320);
        return () => clearInterval(t);
    }, [visible === 0 ? 0 : -1]);

    return (
        <div className="val-demo">
            <div className="val-sql">
                <span className="val-sql-prompt">›</span>
                <span className="val-sql-code">DROP TABLE users; SELECT * FROM orders</span>
            </div>
            <div className="val-checks">
                {CHECKS.map(({ id, label, pass, blocked }, i) => (
                    <div key={id} className={`val-check ${i < visible ? 'val-check-in' : ''}`}>
                        <div className={`val-icon ${blocked ? 'val-blocked' : 'val-pass'}`}>
                            {blocked ? <AlertTriangle size={11} strokeWidth={2.5} /> : <CheckCircle size={11} strokeWidth={2} />}
                        </div>
                        <span className={`val-label ${blocked ? 'val-label-blocked' : ''}`}>{label}</span>
                        {blocked && <span className="val-badge">BLOCKED</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Auto-repair demo ────────────────────────────────────────────
function AutoRepairDemo() {
    const [phase, setPhase] = useState<'fail' | 'repair' | 'success'>('fail');
    useEffect(() => {
        const t1 = setTimeout(() => setPhase('repair'), 1800);
        const t2 = setTimeout(() => setPhase('success'), 3600);
        const t3 = setTimeout(() => setPhase('fail'), 6000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [phase === 'fail' ? 0 : -1]);

    return (
        <div className="repair-demo">
            <div className={`repair-phase ${phase === 'fail' ? 'repair-show' : ''}`}>
                <div className="repair-label repair-err"><AlertTriangle size={12} /> Query failed</div>
                <code className="repair-code">ERROR: column "revenu" does not exist</code>
            </div>
            <div className={`repair-phase ${phase === 'repair' ? 'repair-show' : ''}`}>
                <div className="repair-label repair-thinking"><Zap size={12} /> AI repairing…</div>
                <code className="repair-code repair-typing">Checking schema… "revenue" → found in orders table</code>
            </div>
            <div className={`repair-phase ${phase === 'success' ? 'repair-show' : ''}`}>
                <div className="repair-label repair-ok"><CheckCircle size={12} /> Auto-repaired · retry succeeded</div>
                <code className="repair-code repair-success">5 rows returned · 14.2ms</code>
            </div>
        </div>
    );
}

// ── Architecture flow ───────────────────────────────────────────
const ARCH = [
    { label: 'Browser', sub: 'React + TypeScript', icon: Terminal },
    { label: 'FastAPI Backend', sub: 'Python · Async', icon: Server },
    { label: 'AI Orchestration', sub: 'GPT-4o · Schema-aware', icon: Layers },
    { label: 'Validation Pipeline', sub: '7 security layers', icon: Shield },
    { label: 'Execution Layer', sub: 'AsyncPG · Read-only', icon: Database },
    { label: 'Results + History', sub: 'Formatted · Explained', icon: BarChart2 },
];

function ArchFlow() {
    const [lit, setLit] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setLit(l => (l + 1) % ARCH.length), 800);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="arch-flow">
            {ARCH.map(({ label, sub, icon: Icon }, i) => (
                <div key={label} className={`arch-node ${i <= lit ? 'arch-lit' : ''}`}>
                    <div className="arch-node-icon"><Icon size={16} strokeWidth={1.75} /></div>
                    <div className="arch-node-text">
                        <span className="arch-node-label">{label}</span>
                        <span className="arch-node-sub">{sub}</span>
                    </div>
                    {i < ARCH.length - 1 && (
                        <div className="arch-connector">
                            <div className="arch-connector-fill" style={{ width: i < lit ? '100%' : i === lit ? '60%' : '0%' }} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────
export default function LandingPage({ onEnter }: Props) {
    const [loaded, setLoaded] = useState(false);
    const [out, setOut] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => { setTimeout(() => setLoaded(true), 60); }, []);
    useReveal();

    const handleMouse = useCallback((e: MouseEvent) => {
        setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouse, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouse);
    }, [handleMouse]);

    const go = () => { setOut(true); setTimeout(onEnter, 480); };

    const parallaxStyle = {
        transform: `translate(${mouse.x * -18}px, ${mouse.y * -12}px) scale(1.06)`,
        transition: 'transform 0.8s cubic-bezier(.2,.8,.4,1)',
    };

    return (
        <div className={`lp ${loaded ? 'lp-in' : ''} ${out ? 'lp-out' : ''}`}>

            {/* ══ NAV ══ */}
            <nav className="lp-nav">
                <div className="lp-nav-left">
                    <div className="lp-logomark"><Database size={14} strokeWidth={2.2} /></div>
                    <span className="lp-logotype">TalkToYourDB</span>
                </div>
                <div className="lp-nav-center">
                    <a href="#how">How it works</a>
                    <a href="#features">Features</a>
                    <a href="#security">Security</a>
                    <a href="#arch">Architecture</a>
                </div>
                <button className="lp-nav-cta" onClick={go}>
                    Try it free <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* ══ HERO ══ */}
            <section className="lp-hero" ref={heroRef}>
                {/* Parallax photo */}
                <div className="lp-hero-photo" style={parallaxStyle} />
                {/* Layered veils */}
                <div className="lp-hero-veil-top" />
                <div className="lp-hero-veil-bottom" />

                {/* Floating grid */}
                <div className="lp-hero-grid" />

                <div className="lp-hero-body">
                    <div className="lp-hero-kicker" data-rv>
                        <span className="lp-kicker-dot" />
                        Production-grade AI · PostgreSQL · Schema-aware
                    </div>

                    <h1 className="lp-hero-h1" data-rv>
                        Talk to your<br />
                        database.
                    </h1>

                    <p className="lp-hero-sub" data-rv>
                        Not your SQL editor. TalkToYourDB is a production AI pipeline —
                        schema-aware, multi-layer validated, self-healing. Built for engineers
                        who need answers, not accidents.
                    </p>

                    <div className="lp-hero-actions" data-rv>
                        <button className="lp-cta-main" onClick={go}>
                            Start querying <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                        <button className="lp-cta-ghost" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                            Watch demo
                        </button>
                    </div>

                    <div className="lp-hero-meta" data-rv>
                        <span><CheckCircle size={12} /> Read-only transactions</span>
                        <span><Shield size={12} /> 7-layer validation</span>
                        <span><RefreshCw size={12} /> Auto-repair AI</span>
                        <span><Zap size={12} /> ~1s response</span>
                    </div>
                </div>

                {/* Live pipeline on right */}
                <div className="lp-hero-pipeline" data-rv>
                    <div className="lp-pipeline-frame">
                        <div className="lp-pipeline-header">
                            <span className="lpd r" /><span className="lpd y" /><span className="lpd g" />
                            <span className="lp-pipeline-title">AI Pipeline · live</span>
                            <span className="lp-pipeline-status"><span className="lp-status-dot" />running</span>
                        </div>
                        <SqlPipeline />
                    </div>
                </div>

                <button className="lp-scroll-cue" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                    <ChevronDown size={16} strokeWidth={1.5} />
                </button>
            </section>

            {/* ══ DEMO ══ */}
            <section className="lp-demo-sec" id="demo">
                <div className="lp-container">
                    <div className="lp-sec-tag" data-rv>Product demo</div>
                    <h2 className="lp-sec-h2" data-rv>
                        Ask. Get SQL. See results.<br />
                        <span className="lp-h2-dim">No query syntax. No guessing.</span>
                    </h2>
                    <div className="lp-demo-stage" data-rv>
                        <div className="lp-demo-glow" />
                        <div className="lp-demo-chrome">
                            <div className="lp-chrome-bar">
                                <span className="lpd r" /><span className="lpd y" /><span className="lpd g" />
                                <span className="lp-chrome-title">TalkToYourDB — Query Builder</span>
                            </div>
                            <video className="lp-demo-video" src="/aisql.mp4" autoPlay muted loop playsInline />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section className="lp-how-sec" id="how">
                <div className="lp-container">
                    <div className="lp-sec-tag" data-rv>How it works</div>
                    <h2 className="lp-sec-h2" data-rv>
                        One question.<br />
                        <span className="lp-h2-dim">A full production pipeline.</span>
                    </h2>
                    <div className="lp-how-grid">
                        {[
                            { n: '01', title: 'You ask in plain English', body: 'Type any question about your data. The system reads your full database schema before generating a single character of SQL.' },
                            { n: '02', title: 'AI generates schema-aware SQL', body: 'GPT-4o receives your schema, your question, and a structured prompt. It generates SQL that knows your exact tables, columns, and relationships.' },
                            { n: '03', title: 'Seven validation layers run', body: 'Injection detection, keyword blocking, stacked-query analysis, normalization checks — before execution, every query is scrutinised.' },
                            { n: '04', title: 'Results returned with explanation', body: 'You get rows, execution time, row count, and a plain-English explanation of exactly what the query does and why.' },
                        ].map(({ n, title, body }) => (
                            <div className="lp-how-card" key={n} data-rv>
                                <span className="lp-how-n">{n}</span>
                                <h3 className="lp-how-title">{title}</h3>
                                <p className="lp-how-body">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FEATURES ══ */}
            <section className="lp-feat-sec" id="features">
                <div className="lp-container">
                    <div className="lp-sec-tag" data-rv>Features</div>
                    <h2 className="lp-sec-h2" data-rv>
                        Built for reliability.<br />
                        <span className="lp-h2-dim">Not just demo-ability.</span>
                    </h2>

                    {/* Feature: Validation */}
                    <div className="lp-feat-row" data-rv>
                        <div className="lp-feat-text">
                            <div className="lp-feat-tag"><Shield size={13} /> Multi-layer validation</div>
                            <h3 className="lp-feat-h3">Every query is interrogated<br />before it runs.</h3>
                            <p className="lp-feat-p">Seven independent security checks run in sequence. SQL injection heuristics, stacked-query detection, dangerous keyword blocking — and if anything fails, the query never touches your database.</p>
                            <ul className="lp-feat-list">
                                {['SELECT-only enforcement', 'Injection pattern detection', 'pg_sleep and function blocking', 'Query normalisation', 'Stacked query prevention'].map(t => (
                                    <li key={t}><CheckCircle size={13} className="lp-feat-check" />{t}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="lp-feat-demo-wrap">
                            <ValidationDemo />
                        </div>
                    </div>

                    {/* Feature: Auto-repair */}
                    <div className="lp-feat-row lp-feat-row-rev" data-rv>
                        <div className="lp-feat-text">
                            <div className="lp-feat-tag"><RefreshCw size={13} /> AI Auto-Repair</div>
                            <h3 className="lp-feat-h3">Queries that fail<br />fix themselves.</h3>
                            <p className="lp-feat-p">When a generated query fails, the error is captured, fed back into the AI with schema context, and a corrected query is generated and retried — automatically. You see a result, not an error.</p>
                            <ul className="lp-feat-list">
                                {['Error capture and classification', 'Schema-context retry prompt', 'Automatic re-execution', 'Transparent in query history'].map(t => (
                                    <li key={t}><CheckCircle size={13} className="lp-feat-check" />{t}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="lp-feat-demo-wrap">
                            <AutoRepairDemo />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ SECURITY ══ */}
            <section className="lp-sec-sec" id="security">
                <div className="lp-container">
                    <div className="lp-sec-tag" data-rv>Security</div>
                    <h2 className="lp-sec-h2" data-rv>
                        Defence in depth.<br />
                        <span className="lp-h2-dim">Not trust by default.</span>
                    </h2>
                    <div className="lp-security-grid">
                        {[
                            { icon: Lock, title: 'Read-only transactions', body: 'Every query runs inside a read-only transaction. Even if validation fails, your data cannot be mutated.' },
                            { icon: Shield, title: 'Injection heuristics', body: 'Pattern-based and normalisation-based injection detection, independent from the AI output layer.' },
                            { icon: Server, title: 'Isolated execution pools', body: 'Queries execute in isolated async pools with hard timeouts. One bad query cannot block another.' },
                            { icon: AlertTriangle, title: 'Row limiting', body: 'Results are capped server-side. No query can accidentally return millions of rows to the client.' },
                            { icon: GitBranch, title: 'Restricted DB users', body: 'The database user has no write permissions, no schema access, and no ability to call dangerous functions.' },
                            { icon: Zap, title: 'Schema-aware prompting', body: 'The AI only knows what you expose. Schema is filtered before it reaches the model prompt.' },
                        ].map(({ icon: Icon, title, body }) => (
                            <div className="lp-sec-card" key={title} data-rv>
                                <div className="lp-sec-icon"><Icon size={18} strokeWidth={1.75} /></div>
                                <h3 className="lp-sec-title">{title}</h3>
                                <p className="lp-sec-body">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ ARCHITECTURE ══ */}
            <section className="lp-arch-sec" id="arch">
                <div className="lp-container">
                    <div className="lp-sec-tag" data-rv>Architecture</div>
                    <h2 className="lp-sec-h2" data-rv>
                        A system, not a feature.<br />
                        <span className="lp-h2-dim">End to end.</span>
                    </h2>
                    <div className="lp-arch-wrap" data-rv>
                        <ArchFlow />
                    </div>
                    <div className="lp-stack-row" data-rv>
                        {['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'GPT-4o', 'AsyncPG', 'Docker'].map(t => (
                            <span className="lp-stack-pill" key={t}>{t}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <section className="lp-end">
                <div className="lp-end-glow" />
                <div className="lp-container lp-end-inner" data-rv>
                    <h2 className="lp-end-h2">
                        Stop writing SQL.<br />
                        <em>Start asking questions.</em>
                    </h2>
                    <p className="lp-end-sub">
                        Production-safe. Schema-aware. Self-healing.
                        Your database, finally conversational.
                    </p>
                    <button className="lp-cta-main lp-end-cta" onClick={go}>
                        Try TalkToYourDB <ArrowRight size={15} strokeWidth={2.2} />
                    </button>
                </div>
            </section>

            <footer className="lp-footer">
                <span className="lp-footer-brand">TalkToYourDB</span>
                <span className="lp-footer-copy">FastAPI · PostgreSQL · GPT-4o</span>
            </footer>
        </div>
    );
}
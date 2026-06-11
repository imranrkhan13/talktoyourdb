// LandingPage.tsx — Premium, minimal, monochrome
import { useEffect, useState, useRef } from 'react';
import { Database, Zap, ShieldCheck, ArrowRight, Lock, RefreshCw, Clock, ChevronDown, Terminal } from 'lucide-react';

interface Props { onEnter: () => void; }

const QUERIES = [
    'Show top 5 customers by revenue last month',
    'Which products are low on stock?',
    'List users who placed more than 3 orders',
    'Count orders grouped by status',
];

const FEATURES = [
    { icon: Database, title: 'Schema-Aware Context', desc: 'Injects complete relation graphs and constraints into the context window before execution. Zero hallucinated attributes.' },
    { icon: ShieldCheck, title: 'Multi-Layer Guardrails', desc: 'Strict AST parsing detects injections, blocks destructive keywords, and analyzes stacked statements before execution.' },
    { icon: Lock, title: 'Enforced Read-Only', desc: 'Executes within isolated, read-only transactions with tight execution timeouts. Mutation is architecturally impossible.' },
    { icon: RefreshCw, title: 'Self-Healing Engine', desc: 'If a database engine returns an error, the trace is instantly fed back into the pipeline for automated query repair.' },
    { icon: Zap, title: 'Deterministic Output', desc: 'Compiles natural language to precise SQL, validates syntax, executes, and explains execution plans in under a second.' },
    { icon: Clock, title: 'Historical Audit Trace', desc: 'Persists execution traces, performance metrics, and row counts. One-click execution from history.' },
];

export default function LandingPage({ onEnter }: Props) {
    const [qi, setQi] = useState(0);
    const [txt, setTxt] = useState('');
    const [del, setDel] = useState(false);
    const [visible, setVisible] = useState(false);
    const [out, setOut] = useState(true); // Control exit state smoothly

    useEffect(() => { setVisible(true); }, []);

    useEffect(() => {
        const currentQuery = QUERIES[qi];
        let timer: ReturnType<typeof setTimeout>;

        if (!del && txt.length < currentQuery.length) {
            timer = setTimeout(() => setTxt(currentQuery.slice(0, txt.length + 1)), 40);
        } else if (!del && txt.length === currentQuery.length) {
            timer = setTimeout(() => setDel(true), 2500);
        } else if (del && txt.length > 0) {
            timer = setTimeout(() => setTxt(currentQuery.slice(0, txt.length - 1)), 15);
        } else {
            setDel(false);
            setQi(prev => (prev + 1) % QUERIES.length);
        }
        return () => clearTimeout(timer);
    }, [txt, del, qi]);

    const handleEnter = () => {
        setVisible(false);
        setTimeout(onEnter, 400);
    };

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`lp-wrapper ${visible ? 'is-visible' : 'is-hidden'}`}>

            {/* Global Grid Overlay for Architectural Vibe */}
            <div className="lp-grid-overlay" />

            {/* Navigation Header */}
            <nav className="lp-nav">
                <div className="lp-nav-container">
                    <div className="lp-brand">
                        <div className="lp-logo-mark">
                            <Database size={14} strokeWidth={2.5} />
                        </div>
                        <span className="lp-logo-text">TalkTo<span className="weight-medium">YourDB</span></span>
                    </div>
                    <div className="lp-nav-actions">
                        <button className="lp-nav-link" onClick={() => scrollTo('demo')}>Demo</button>
                        <button className="lp-nav-link" onClick={() => scrollTo('features')}>Features</button>
                        <button className="lp-btn-action" onClick={handleEnter}>
                            Launch Console
                            <ArrowRight size={13} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="lp-hero">
                <div className="lp-hero-content">
                    <div className="lp-badge">
                        <span className="lp-badge-dot" />
                        LLM-Compiler · Native PostgreSQL · Production Safe
                    </div>

                    <h1 className="lp-title">
                        Ask your database<br />
                        <span className="text-muted font-serif">anything.</span>
                    </h1>

                    <p className="lp-subtitle">
                        Compile natural language statements into schema-aware, high-performance SQL.
                        Validated, executed, and explained in plain English natively within 100ms.
                    </p>

                    {/* Interactive Typewriter Prompt Area */}
                    <div className="lp-terminal-prompt">
                        <Terminal size={14} className="text-muted" />
                        <span className="lp-prompt-text">{txt}</span>
                        <span className="lp-cursor" />
                    </div>

                    <div className="lp-cta-group">
                        <button className="lp-btn-primary" onClick={handleEnter}>
                            Initialize Sandbox
                            <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                        <button className="lp-btn-secondary" onClick={() => scrollTo('demo')}>
                            Review Architecture
                        </button>
                    </div>

                    <div className="lp-compliance-row">
                        <span className="compliance-item"><Lock size={12} /> Isolated Read-Only</span>
                        <span className="compliance-item"><ShieldCheck size={12} /> AST Injection Guard</span>
                        <span className="compliance-item"><Zap size={12} /> Auto-Healing</span>
                    </div>
                </div>

                {/* Main Hero Asset Panel */}
                <div className="lp-hero-viewport">
                    <div className="viewport-inner">
                        <img
                            src="/fella.png"
                            alt="Database Query Analyzer System Interface"
                            className="lp-hero-image"
                            loading="eager"
                        />
                    </div>
                </div>

                <button className="lp-scroll-indicator" onClick={() => scrollTo('demo')} aria-label="Scroll details">
                    <ChevronDown size={16} strokeWidth={2} />
                </button>
            </section>

            {/* Live Infrastructure / Demonstration Section */}
            <section className="lp-section border-top" id="demo">
                <div className="lp-section-header">
                    <span className="section-tag">Telemetry & Run-Time Execution</span>
                    <h2 className="section-title">From natural language to structured execution sets.</h2>
                </div>

                <div className="lp-video-container">
                    <div className="video-window-frame">
                        <div className="frame-header">
                            <div className="frame-dots">
                                <span className="dot" /><span className="dot" /><span className="dot" />
                            </div>
                            <div className="frame-title">aisql.mov — Terminal Player</div>
                        </div>
                        <div className="frame-body">
                            <video
                                className="lp-video-player"
                                src="/aisql.mov"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Architectural Features Grid */}
            <section className="lp-section border-top" id="features">
                <div className="lp-section-header">
                    <span className="section-tag">Technical Specification</span>
                    <h2 className="section-title">Engineered for security. Formulated for high availability.</h2>
                </div>

                <div className="lp-grid-features">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div className="lp-feature-card" key={title}>
                            <div className="feature-icon-wrapper">
                                <Icon size={16} strokeWidth={2} />
                            </div>
                            <h3 className="feature-card-title">{title}</h3>
                            <p className="feature-card-description">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Action Call / Closure Section */}
            <section className="lp-section border-top bg-subtle">
                <div className="lp-cta-block">
                    <h2 className="cta-heading">Your transactional store,<br />finally <span className="font-serif text-muted">conversational.</span></h2>
                    <p className="cta-subheading">Connect cleanly via safe, standard connection configurations. No migrations required.</p>
                    <button className="lp-btn-primary" onClick={handleEnter}>
                        Boot Analytics Environment
                        <ArrowRight size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </section>

            {/* Structural Architectural Footer */}
            <footer className="lp-footer border-top">
                <div className="lp-footer-content">
                    <span className="footer-brand">TalkToYourDB</span>
                    <span className="footer-meta text-muted">Engine: FastAPI · Context Provider: OpenAI GPT-4o · Target Store: PostgreSQL</span>
                </div>
            </footer>
        </div>
    );
}
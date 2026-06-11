// LandingPage.tsx — TalkToYourDB • Sky-palette landing
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight, Upload, FileText, Sparkles, Download,
    CheckCircle, ChevronDown, Star, Zap, Shield, BarChart2,
    ChevronRight, Plus, Minus
} from 'lucide-react';

interface Props { onEnter: () => void; }

/* ── useReveal: adds .revealed to elements once they scroll into view ── */
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('[data-reveal]');
        const io = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }),
            { threshold: 0.12 }
        );
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);
}

const HOW = [
    {
        step: '01',
        icon: Upload,
        title: 'Understand Schema',
        desc: 'Analyze tables, columns, relationships, foreign keys, and metadata before SQL generation.'
    },
    {
        step: '02',
        icon: Sparkles,
        title: 'Generate SQL',
        desc: 'Convert natural language into schema-aware PostgreSQL queries.'
    },
    {
        step: '03',
        icon: Shield,
        title: 'Validate & Secure',
        desc: 'Run SQL through injection detection, query normalization, and safety enforcement.'
    },
    {
        step: '04',
        icon: CheckCircle,
        title: 'Execute & Explain',
        desc: 'Execute safely inside read-only transactions and explain results in plain English.'
    }
]

const FEATURES = [
    {
        icon: Sparkles,
        title: 'Schema-Aware Generation',
        desc: 'Database structure is analyzed before SQL generation.'
    },
    {
        icon: Shield,
        title: 'Multi-Layer Validation',
        desc: 'Injection detection, dangerous keyword blocking, and query normalization.'
    },
    {
        icon: CheckCircle,
        title: 'AI Auto-Repair',
        desc: 'Failed SQL is automatically repaired and retried.'
    },
    {
        icon: Zap,
        title: 'Read-Only Execution',
        desc: 'Queries execute safely inside isolated transactions.'
    },
    {
        icon: FileText,
        title: 'Query Explanations',
        desc: 'Every query is translated into plain English.'
    },
    {
        icon: BarChart2,
        title: 'Realtime Schema Browser',
        desc: 'Explore tables, columns, relationships, and metadata.'
    }
]


export default function LandingPage({ onEnter }: Props) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);
    useReveal();

    const go = () => { setExiting(true); setTimeout(onEnter, 500); };
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className={`lp ${visible ? 'lp-in' : ''} ${exiting ? 'lp-out' : ''}`}>

            {/* ══ NAV ══ */}
            <nav className="lp-nav">
                <div className="lp-nav-logo">
                    <div className="lp-nav-logomark">R</div>
                    <span>Resume<strong>AI</strong></span>
                </div>
                <div className="lp-nav-links">
                    <a href="#how">How it works</a>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                </div>
                <button className="lp-nav-cta" onClick={go}>
                    Tailor my resume <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* ══ HERO ══ */}
            <section className="lp-hero">
                <div className="lp-hero-photo" />
                <div className="lp-hero-veil" />

                <div className="lp-hero-content">
                    <div className="lp-hero-tag">
                        <span className="lp-tag-dot" />
                        Production-Grade AI for PostgreSQL • Secure • Schema-Aware
                    </div>

                    <h1 className="lp-hero-h1">
                        Talk to your database.<br />Not<br />
                        <em>your SQL editor.</em>
                    </h1>

                    <p className="lp-hero-sub">
                        Ask questions in plain English. Generate schema-aware SQL, validate it through multiple security layers,<br />
                        execute safely, and get instant answers from PostgreSQL.
                    </p>

                    <div className="lp-hero-actions">
                        <button className="lp-btn-hero" onClick={go}>
                            Launch TalkToYourDB
                            <ArrowRight size={15} strokeWidth={2.2} />
                        </button>
                        <button className="lp-btn-hero-ghost" onClick={() => scrollTo('demo')}>
                            <span className="lp-play-icon"><ChevronRight size={12} strokeWidth={3} /></span>
                            See it in action
                        </button>
                    </div>

                    <div className="lp-hero-trust">
                        <div className="lp-trust-item">
                            <div className="lp-trust-stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                            <span>Schema-Aware SQL</span>
                        </div>
                        <span className="lp-trust-div" />
                        <span className="lp-trust-item">Multi-Layer Validation</span>
                        <span className="lp-trust-div" />
                        <span className="lp-trust-item">Read-Only Execution</span>
                    </div>
                </div>

                <button className="lp-hero-scroll" onClick={() => scrollTo('demo')}>
                    <ChevronDown size={16} strokeWidth={1.75} />
                </button>
            </section>

            {/* ══ DEMO ══ */}
            <section className="lp-demo" id="demo">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>Live Product Demo</div>
                    <h2 className="lp-section-h2" data-reveal>
                        From natural language
                        to trusted database answers.<br />
                        <span className="lp-h2-muted">In 30 seconds.</span>
                    </h2>
                    <div className="lp-video-reveal" data-reveal>
                        <div className="lp-video-border-glow" />
                        <div className="lp-video-shell">
                            <div className="lp-video-bar">
                                <span className="lp-vdot r" /><span className="lp-vdot y" /><span className="lp-vdot g" />
                                <span className="lp-video-bar-title">TalkToYourDB</span>
                            </div>
                            <video
                                ref={videoRef}
                                className="lp-video-el"
                                src="/aisql.mov"
                                autoPlay muted loop playsInline
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section className="lp-how" id="how">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>How it works</div>
                    <h2 className="lp-section-h2" data-reveal>
                        Four steps.<br />
                        <span className="lp-h2-muted">One great resume.</span>
                    </h2>
                    <div className="lp-how-steps">
                        {HOW.map(({ step, icon: Icon, title, desc }) => (
                            <div className="lp-step" key={step} data-reveal>
                                <div className="lp-step-top">
                                    <span className="lp-step-n">{step}</span>
                                    <div className="lp-step-icon"><Icon size={20} strokeWidth={1.75} /></div>
                                </div>
                                <h3 className="lp-step-title">{title}</h3>
                                <p className="lp-step-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FEATURES ══ */}
            <section className="lp-features-sec" id="features">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>AI features</div>
                    <h2 className="lp-section-h2" data-reveal>
                        Production AI<br />
                        <span className="lp-h2-muted">for database teams.</span>
                    </h2>
                    <div className="lp-feat-grid">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div className="lp-feat-card" key={title} data-reveal>
                                <div className="lp-feat-iconwrap"><Icon size={19} strokeWidth={1.75} /></div>
                                <h3 className="lp-feat-title">{title}</h3>
                                <p className="lp-feat-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <section className="lp-final">
                <div className="lp-final-bg" />
                <div className="lp-container lp-final-inner" data-reveal>
                    <div className="lp-final-tag">Start for free · No credit card needed</div>
                    <h2 className="lp-final-h2">
                        Stop writing SQL.<br />Start asking questions.
                    </h2>
                    <p className="lp-final-sub">
                        Secure, schema-aware, production-grade AI for PostgreSQL.
                    </p>
                    <button className="lp-btn-hero lp-final-btn" onClick={go}>
                       Launch TalkToYourDB <ArrowRight size={15} strokeWidth={2.2} />
                    </button>
                </div>
            </section>

            <footer className="lp-footer">
                <span className="lp-footer-brand">TalkToYourDB</span>
                <span className="lp-footer-copy">Conversational PostgreSQL Intelligence</span>
            </footer>
        </div>
    );
}
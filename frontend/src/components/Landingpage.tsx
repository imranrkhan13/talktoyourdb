// LandingPage.tsx — High-Impact, Minimalist & Bold
import { useEffect, useState, useRef } from 'react';
import { Database, Zap, ShieldCheck, ArrowRight, Lock, RefreshCw, Clock, ChevronDown, Play, Sparkles, Swords, Flame, ShieldAlert } from 'lucide-react';

interface Props { onEnter: () => void; }

const PHRASES = [
    'Conquer your data constraints instantly',
    'Unleash direct insights with zero resistance',
    'Break through complex schema walls',
    'Command your backend store effortlessly',
];

const IMPACT_FEATURES = [
    { icon: Swords, title: 'Absolute Schema Mastery', desc: 'Shatter structural confusion. Your system is fully mapped and understood instantly before execution.' },
    { icon: Flame, title: 'Uncompromising Protection', desc: 'Defend your realm. Multi-layered structural guardrails neutralize threats and malicious strikes clean.' },
    { icon: Lock, title: 'Enforced Read-Only Stronghold', desc: 'Architecturally locked. Pure data retrieval routes that secure your state against accidental mutations.' },
    { icon: RefreshCw, title: 'Self-Healing Resilience', desc: 'Instant recovery mechanics. When an engine stumbles, the pipeline self-corrects and executes anyway.' },
    { icon: Zap, title: 'Lightning Force Explanations', desc: 'Raw execution turned into immediate, clear tactical breakdowns in less than a single breath.' },
    { icon: Clock, title: 'Infinite History Vault', desc: 'Every victorious query logged, preserved, and primed for immediate re-deployment at your command.' },
];

export default function LandingPage({ onEnter }: Props) {
    const [pi, setPi] = useState(0);
    const [txt, setTxt] = useState('');
    const [del, setDel] = useState(false);
    const [visible, setVisible] = useState(false);
    const [out, setOut] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setTimeout(() => setVisible(true), 80);
    }, []);

    useEffect(() => {
        const p = PHRASES[pi];
        let t: ReturnType<typeof setTimeout>;
        if (!del && txt.length < p.length) {
            t = setTimeout(() => setTxt(p.slice(0, txt.length + 1)), 40);
        } else if (!del && txt.length === p.length) {
            t = setTimeout(() => setDel(true), 2000);
        } else if (del && txt.length > 0) {
            t = setTimeout(() => setTxt(p.slice(0, txt.length - 1)), 15);
        } else {
            setDel(false);
            setPi(i => (i + 1) % PHRASES.length);
        }
        return () => clearTimeout(t);
    }, [txt, del, pi]);

    const go = () => {
        setOut(true);
        setTimeout(onEnter, 500);
    };

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePlayVideo = () => {
        setIsPlayingVideo(true);
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }
    };

    return (
        <div className={`lp ${visible ? 'lp-in' : ''} ${out ? 'lp-out' : ''}`}>

            {/* NAV */}
            <nav className="lp-nav">
                <div className="lp-brand">
                    <div className="lp-brand-mark" style={{ background: '#0a0c10' }}>
                        <Swords size={14} strokeWidth={2.5} />
                    </div>
                    <span className="lp-brand-name">TalkTo<strong>YourDB</strong></span>
                </div>
                <div className="lp-nav-links">
                    <a href="#arena" onClick={(e) => { e.preventDefault(); scrollTo('arena'); }}>The Arena</a>
                    <a href="#arsenal" onClick={(e) => { e.preventDefault(); scrollTo('arsenal'); }}>The Arsenal</a>
                </div>
                <button className="lp-nav-btn" onClick={go}>
                    Enter Console <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </nav>

            {/* HERO SECTION WITH IMAGE BACKGROUND */}
            <section
                className="lp-hero"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.95)), url('/fella.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="lp-hero-body" style={{ maxWidth: '840px', paddingTop: '6rem' }}>
                    <span className="lp-eyebrow-pill" style={{ background: '#111', color: '#fff', borderColor: '#000' }}>
                        <Swords size={12} className="lp-pill-dot" style={{ background: 'transparent', animation: 'none', color: '#fff' }} />
                        Break down data barriers completely
                    </span>

                    <h1 className="lp-hero-h1" style={{ letterSpacing: '-2px' }}>
                        Command your engine<br /><em style={{ color: '#111', fontWeight: '800', textDecoration: 'underline' }}>without fear.</em>
                    </h1>

                    <p className="lp-hero-p" style={{ color: '#1f2937', fontWeight: 500, maxWidth: '520px' }}>
                        Stop writing code to speak with your systems. Challenge your database in plain words, bypass structural hurdles, and extract instant absolute truth.
                    </p>

                    <div className="lp-tw" style={{ background: '#fff', borderColor: '#111', borderWidth: '2px' }}>
                        <span className="lp-tw-icon" style={{ color: '#111' }}><Swords size={14} /></span>
                        <span className="lp-tw-text" style={{ fontWeight: 600 }}>{txt}</span>
                        <span className="lp-tw-cur" style={{ background: '#111' }} />
                    </div>

                    <div className="lp-hero-btns" style={{ marginTop: '0.5rem' }}>
                        <button className="lp-btn-primary" onClick={go} style={{ background: '#0a0c10', padding: '.85rem 2.2rem' }}>
                            Claim Free Access <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                        <button className="lp-btn-outline" onClick={() => scrollTo('arena')} style={{ borderWidth: '2px', borderColor: '#0a0c10', color: '#0a0c10', fontWeight: 700 }}>
                            Witness It Live
                        </button>
                    </div>

                    <div className="lp-hero-meta" style={{ color: '#4b5563', marginTop: '1.5rem' }}>
                        <span><Lock size={12} style={{ color: '#000' }} /> Absolute Fortification</span>
                        <span><ShieldCheck size={12} style={{ color: '#000' }} /> Threat Defense Shield</span>
                        <span><Sparkles size={12} style={{ color: '#000' }} /> Immediate Recovery</span>
                    </div>
                </div>

                <button className="lp-chevron" onClick={() => scrollTo('arena')} aria-label="Advance downward">
                    <ChevronDown size={18} strokeWidth={2} />
                </button>
            </section>

            {/* VIDEO SECTION WITH REVOLUTIONIZED ANIMATED OVERLAY */}
            <section className="lp-video-sec" id="arena" style={{ background: '#fff' }}>
                <div className="lp-section-inner">
                    <p className="lp-tag" style={{ color: '#000' }}>The Proving Grounds</p>
                    <h2 className="lp-h2" style={{ letterSpacing: '-1px' }}>Watch confusion dissolve into clarity instantly.</h2>

                    <div className="lp-video-wrap" style={{ margin: '0 auto' }}>
                        <div className="lp-video-chrome" style={{ border: '2px solid #0a0c10', borderRadius: '16px' }}>
                            <div className="lp-vcbar" style={{ background: '#0a0c10', padding: '.85rem 1.25rem' }}>
                                <span className="lp-vd r" style={{ background: '#ef4444' }} />
                                <span className="lp-vd y" style={{ background: '#f59e0b' }} />
                                <span className="lp-vd g" style={{ background: '#10b981' }} />
                                <span className="lp-vc-title" style={{ color: '#fff', fontWeight: 600, letterSpacing: '0.5px' }}>LIVE DEMONSTRATION — CRUSHING THE BARRIER</span>
                            </div>

                            <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#07090e' }}>
                                <video
                                    ref={videoRef}
                                    className="lp-video"
                                    src="/aisql.mov"
                                    autoPlay={!isPlayingVideo}
                                    muted={!isPlayingVideo}
                                    loop
                                    playsInline
                                />

                                {/* Wild, Animated Play Shield Overlay */}
                                {!isPlayingVideo && (
                                    <div
                                        onClick={handlePlayVideo}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(10, 12, 16, 0.75)',
                                            backdropFilter: 'blur(6px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                        }}
                                        className="video-strike-overlay"
                                    >
                                        <div
                                            style={{
                                                width: '84px',
                                                height: '84px',
                                                borderRadius: '50%',
                                                background: '#fff',
                                                border: '4px solid #0a0c10',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 30px rgba(255,255,255,0.4)',
                                                marginBottom: '1.25rem',
                                                transition: 'transform 0.2s ease',
                                            }}
                                            className="play-shield-btn"
                                        >
                                            <Play size={28} fill="#0a0c10" stroke="#0a0c10" style={{ marginLeft: '4px' }} />
                                        </div>
                                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                            Unmute Audio & Witness the Strike
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="lp-feat-sec" id="arsenal" style={{ background: '#f9fafb' }}>
                <div className="lp-section-inner">
                    <p className="lp-tag" style={{ color: '#4b5563' }}>Built for the Unstoppable</p>
                    <h2 className="lp-h2" style={{ letterSpacing: '-1px' }}>An elite tactical setup.<br />Forged for ultimate security.</h2>
                    <div className="lp-feat-grid" style={{ borderColor: '#e2e5ea', boxShadow: 'none' }}>
                        {IMPACT_FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div className="lp-feat" key={title} style={{ padding: '2.5rem 2rem' }}>
                                <div className="lp-feat-ico" style={{ background: '#0a0c10', borderColor: '#0a0c10', color: '#fff' }}>
                                    <Icon size={18} strokeWidth={2.2} />
                                </div>
                                <h3 className="lp-feat-title" style={{ fontSize: '15px', fontWeight: 800 }}>{title}</h3>
                                <p className="lp-feat-desc" style={{ color: '#4b5563', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="lp-cta-sec" style={{ background: '#0a0c10' }}>
                <div className="lp-section-inner lp-cta-inner">
                    <h2 className="lp-cta-h2">Your data architecture,<br />finally under <em>absolute command.</em></h2>
                    <p className="lp-cta-p" style={{ color: '#9ca3af' }}>No endless confusion. No friction. Take control immediately.</p>
                    <button className="lp-btn-primary lp-cta-btn" onClick={go} style={{ background: '#fff', color: '#0a0c10', fontWeight: 800 }}>
                        Unleash the Console <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                </div>
            </section>

            <footer className="lp-footer" style={{ background: '#000' }}>
                <span className="lp-footer-name" style={{ color: '#fff', opacity: 0.6 }}>TalkToYourDB</span>
                <span className="lp-footer-info" style={{ color: '#fff', opacity: 0.3 }}>Absolute Direct Command Environment</span>
            </footer>
        </div>
    );
}
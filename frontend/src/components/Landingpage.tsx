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
    { step: '01', icon: Upload, title: 'Upload your resume', desc: 'Drop your current resume in any format. PDF, Word, plain text — we handle it all.' },
    { step: '02', icon: FileText, title: 'Paste the job listing', desc: 'Copy the job description. Every word matters — our AI reads it like a hiring manager.' },
    { step: '03', icon: Sparkles, title: 'AI tailors it for you', desc: 'GPT-4o rewrites, restructures, and optimises your resume for this exact role and ATS.' },
    { step: '04', icon: Download, title: 'Export and apply', desc: 'Download your polished, ATS-ready resume. Apply with confidence.' },
];

const FEATURES = [
    { icon: Zap, title: 'Keyword intelligence', desc: 'Identifies every critical keyword from the JD and weaves them naturally into your resume.' },
    { icon: Shield, title: 'ATS score analysis', desc: 'Scores your resume against 50+ ATS rules before you ever hit submit.' },
    { icon: BarChart2, title: 'Impact quantification', desc: 'Transforms vague bullets into measurable achievements. "Led team" → "Led team of 12, shipped 3 features."' },
    { icon: FileText, title: 'Format perfection', desc: 'Clean, recruiter-friendly formatting that passes bots and impresses humans.' },
    { icon: Sparkles, title: 'Tone matching', desc: 'Matches the language and culture of the company you\'re applying to.' },
    { icon: CheckCircle, title: 'Cover letter too', desc: 'Generates a tailored cover letter that references the exact role and company.' },
];

const FAQS = [
    { q: 'Will this actually pass ATS systems?', a: 'Yes. We test against the same ATS engines used by 90% of Fortune 500 companies, including Workday, Greenhouse, and Lever.' },
    { q: 'Do I need to rewrite my whole resume?', a: 'No. You upload what you have. Our AI improves it. You review, edit, and export.' },
    { q: 'Is my data private?', a: 'Completely. Your resume and job descriptions are never stored beyond your session and are never used for training.' },
    { q: 'What formats does it support?', a: 'PDF, DOCX, and plain text input. You export as a clean, formatted PDF or DOCX.' },
    { q: 'How is this different from ChatGPT?', a: 'ChatGPT gives you generic output. We run a structured pipeline: JD analysis → keyword extraction → ATS scoring → targeted rewrite → format enforcement.' },
];

const PRICING = [
    { name: 'Starter', price: '$0', desc: 'Try it free', features: ['3 tailored resumes/mo', 'ATS score report', 'PDF export', 'Basic keyword matching'], cta: 'Get started free', highlight: false },
    { name: 'Pro', price: '$12', period: '/mo', desc: 'For active job seekers', features: ['Unlimited resumes', 'Cover letter generation', 'DOCX + PDF export', 'Priority AI processing', 'Tone matching'], cta: 'Start Pro', highlight: true },
    { name: 'Teams', price: '$39', period: '/mo', desc: 'For career coaches & firms', features: ['Everything in Pro', 'Up to 10 seats', 'Bulk resume processing', 'White-label exports', 'API access'], cta: 'Contact us', highlight: false },
];

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
                        AI-powered · ATS-optimised · Interview-ready
                    </div>

                    <h1 className="lp-hero-h1">
                        Your resume should<br />open doors,<br />
                        <em>not close them.</em>
                    </h1>

                    <p className="lp-hero-sub">
                        Upload your resume. Paste any job description.<br />
                        Get a tailored, ATS-optimised resume in 30 seconds.
                    </p>

                    <div className="lp-hero-actions">
                        <button className="lp-btn-hero" onClick={go}>
                            Tailor my resume — it's free
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
                            <span>4.9 from 2,400+ users</span>
                        </div>
                        <span className="lp-trust-div" />
                        <span className="lp-trust-item">3× more interviews on average</span>
                        <span className="lp-trust-div" />
                        <span className="lp-trust-item">No credit card required</span>
                    </div>
                </div>

                <button className="lp-hero-scroll" onClick={() => scrollTo('demo')}>
                    <ChevronDown size={16} strokeWidth={1.75} />
                </button>
            </section>

            {/* ══ DEMO ══ */}
            <section className="lp-demo" id="demo">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>Product demo</div>
                    <h2 className="lp-section-h2" data-reveal>
                        From generic to interview-ready.<br />
                        <span className="lp-h2-muted">In 30 seconds.</span>
                    </h2>
                    <div className="lp-video-reveal" data-reveal>
                        <div className="lp-video-border-glow" />
                        <div className="lp-video-shell">
                            <div className="lp-video-bar">
                                <span className="lp-vdot r" /><span className="lp-vdot y" /><span className="lp-vdot g" />
                                <span className="lp-video-bar-title">ResumeAI — Tailor Resume</span>
                            </div>
                            <video
                                ref={videoRef}
                                className="lp-video-el"
                                src="/aisql.mp4"
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

            {/* ══ BEFORE / AFTER ══ */}
            <section className="lp-ba">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>Before vs after</div>
                    <h2 className="lp-section-h2" data-reveal>
                        The difference is<br />
                        <span className="lp-h2-muted">immediately obvious.</span>
                    </h2>
                    <div className="lp-ba-grid" data-reveal>
                        <div className="lp-ba-card lp-ba-before">
                            <div className="lp-ba-label lp-ba-label-bad">Before</div>
                            <div className="lp-ba-resume">
                                <div className="lp-resume-name">John Smith</div>
                                <div className="lp-resume-section-title">Experience</div>
                                <div className="lp-resume-bullet lp-bullet-weak">• Worked on the backend team</div>
                                <div className="lp-resume-bullet lp-bullet-weak">• Helped with various features</div>
                                <div className="lp-resume-bullet lp-bullet-weak">• Participated in code reviews</div>
                                <div className="lp-resume-bullet lp-bullet-weak">• Responsible for some microservices</div>
                                <div className="lp-resume-section-title" style={{ marginTop: '1rem' }}>Skills</div>
                                <div className="lp-resume-skills">Python, JavaScript, Some databases, teamwork</div>
                            </div>
                            <div className="lp-ba-ats">
                                <span className="lp-ats-label">ATS Score</span>
                                <div className="lp-ats-bar"><div className="lp-ats-fill lp-ats-low" style={{ width: '28%' }} /></div>
                                <span className="lp-ats-score lp-ats-score-bad">28 / 100</span>
                            </div>
                        </div>

                        <div className="lp-ba-arrow"><ArrowRight size={28} strokeWidth={1.5} /></div>

                        <div className="lp-ba-card lp-ba-after">
                            <div className="lp-ba-label lp-ba-label-good">After ResumeAI</div>
                            <div className="lp-ba-resume">
                                <div className="lp-resume-name">John Smith</div>
                                <div className="lp-resume-section-title">Experience</div>
                                <div className="lp-resume-bullet lp-bullet-strong">• Engineered 4 high-traffic REST APIs serving 2M+ daily requests using Python and FastAPI</div>
                                <div className="lp-resume-bullet lp-bullet-strong">• Reduced API latency by 40% through Redis caching and query optimisation</div>
                                <div className="lp-resume-bullet lp-bullet-strong">• Led cross-functional code reviews across a team of 8 engineers</div>
                                <div className="lp-resume-section-title" style={{ marginTop: '1rem' }}>Skills</div>
                                <div className="lp-resume-skills">Python · FastAPI · PostgreSQL · Redis · Docker · Kubernetes · REST APIs · System Design</div>
                            </div>
                            <div className="lp-ba-ats">
                                <span className="lp-ats-label">ATS Score</span>
                                <div className="lp-ats-bar"><div className="lp-ats-fill lp-ats-high" style={{ width: '94%' }} /></div>
                                <span className="lp-ats-score lp-ats-score-good">94 / 100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ ATS SECTION ══ */}
            <section className="lp-ats-sec">
                <div className="lp-container lp-ats-inner">
                    <div className="lp-ats-text" data-reveal>
                        <div className="lp-section-label">Why ATS matters</div>
                        <h2 className="lp-section-h2" style={{ textAlign: 'left' }}>
                            75% of resumes<br />never reach a human.
                        </h2>
                        <p className="lp-ats-p">
                            Applicant Tracking Systems filter out most resumes before a recruiter sees them.
                            Not because the candidate is unqualified — because the resume wasn't written for the machine first.
                        </p>
                        <ul className="lp-ats-list">
                            {['Matches exact keywords from the job description', 'Correct section headings ATS systems expect', 'Quantified achievements over vague responsibilities', 'Clean formatting parseable by every major ATS'].map(t => (
                                <li key={t}><CheckCircle size={15} className="lp-check" />{t}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="lp-ats-visual" data-reveal>
                        <div className="lp-ats-ring">
                            <svg viewBox="0 0 120 120" className="lp-ring-svg">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#E8F4FD" strokeWidth="10" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#2E7DD1" strokeWidth="10"
                                    strokeDasharray="314" strokeDashoffset="20" strokeLinecap="round"
                                    transform="rotate(-90 60 60)" className="lp-ring-progress" />
                            </svg>
                            <div className="lp-ring-inner">
                                <span className="lp-ring-pct">94%</span>
                                <span className="lp-ring-lbl">ATS pass rate</span>
                            </div>
                        </div>
                        <div className="lp-ats-stat-row">
                            {[['3×', 'more interviews'], ['30s', 'avg tailoring time'], ['50+', 'ATS rules checked']].map(([v, l]) => (
                                <div className="lp-ats-stat" key={l}>
                                    <span className="lp-ats-stat-val">{v}</span>
                                    <span className="lp-ats-stat-lbl">{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FEATURES ══ */}
            <section className="lp-features-sec" id="features">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>AI features</div>
                    <h2 className="lp-section-h2" data-reveal>
                        Built for every part<br />
                        <span className="lp-h2-muted">of the job search.</span>
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

            {/* ══ PRICING ══ */}
            <section className="lp-pricing" id="pricing">
                <div className="lp-container">
                    <div className="lp-section-label" data-reveal>Pricing</div>
                    <h2 className="lp-section-h2" data-reveal>
                        Simple pricing.<br />
                        <span className="lp-h2-muted">No surprises.</span>
                    </h2>
                    <div className="lp-pricing-grid">
                        {PRICING.map(({ name, price, period, desc, features, cta, highlight }) => (
                            <div className={`lp-plan ${highlight ? 'lp-plan-hi' : ''}`} key={name} data-reveal>
                                {highlight && <div className="lp-plan-badge">Most popular</div>}
                                <div className="lp-plan-name">{name}</div>
                                <div className="lp-plan-price">
                                    {price}<span className="lp-plan-period">{period}</span>
                                </div>
                                <div className="lp-plan-desc">{desc}</div>
                                <ul className="lp-plan-features">
                                    {features.map(f => (
                                        <li key={f}><CheckCircle size={13} className="lp-plan-check" />{f}</li>
                                    ))}
                                </ul>
                                <button className={`lp-plan-btn ${highlight ? 'lp-plan-btn-hi' : ''}`} onClick={go}>{cta}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FAQ ══ */}
            <section className="lp-faq">
                <div className="lp-container lp-faq-inner">
                    <div data-reveal>
                        <div className="lp-section-label">FAQ</div>
                        <h2 className="lp-section-h2" style={{ textAlign: 'left' }}>
                            Honest answers<br />to real questions.
                        </h2>
                    </div>
                    <div className="lp-faq-list" data-reveal>
                        {FAQS.map(({ q, a }, i) => (
                            <div className={`lp-faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {q}
                                    <span className="lp-faq-icon">{openFaq === i ? <Minus size={15} /> : <Plus size={15} />}</span>
                                </button>
                                {openFaq === i && <div className="lp-faq-a">{a}</div>}
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
                        Your next interview<br />starts with a better resume.
                    </h2>
                    <p className="lp-final-sub">
                        Stop getting filtered out. Start getting called back.
                    </p>
                    <button className="lp-btn-hero lp-final-btn" onClick={go}>
                        Tailor my resume now <ArrowRight size={15} strokeWidth={2.2} />
                    </button>
                </div>
            </section>

            <footer className="lp-footer">
                <span className="lp-footer-brand">ResumeAI</span>
                <span className="lp-footer-copy">© 2025 ResumeAI · Privacy · Terms</span>
            </footer>
        </div>
    );
}
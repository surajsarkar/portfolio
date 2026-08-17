import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_EMAIL, sendContactMessage } from '../lib/contact';

gsap.registerPlugin(ScrollTrigger);

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

// ============================================
// CONTACT FORM — works on static hosts (GH Pages)
// ============================================
const ContactForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [botcheck, setBotcheck] = useState('');
    const [status, setStatus] = useState<FormStatus>('idle');
    const [feedback, setFeedback] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            // ignore
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;

        setStatus('sending');
        setFeedback('');

        const result = await sendContactMessage({ email, message, botcheck });

        if (result.ok) {
            setStatus('success');
            setFeedback(result.message);
            setEmail('');
            setMessage('');
            window.dispatchEvent(new CustomEvent('dobby-show-popper'));
            window.setTimeout(() => onClose(), 2200);
        } else {
            setStatus('error');
            setFeedback(result.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-4 w-full max-w-lg rounded-xl border border-cream/15 p-4"
            style={{
                background: 'rgba(20, 20, 18, 0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow:
                    '0 8px 32px rgba(12, 12, 11, 0.45), inset 0 1px 0 rgba(235, 230, 220, 0.08)',
                animation: 'formIn 420ms cubic-bezier(0.23, 1, 0.32, 1) both',
            }}
            noValidate
        >
            {/* To Field - Email in pill */}
            <div className="mb-4 flex items-center gap-2">
                <span className="px-4 py-2 rounded-lg border border-cream/20 bg-cream/10 font-mono text-sm text-cream">
                    {CONTACT_EMAIL}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="pressable rounded-lg border border-cream/20 bg-cream/10 p-2 text-cream hover:bg-cream/15"
                    aria-label="Copy email"
                    title={copied ? 'Copied' : 'Copy email'}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="pressable ml-auto rounded-lg border border-cream/15 p-2 text-cream/50 hover:border-cream/30 hover:text-cream"
                    aria-label="Close form"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Honeypot — hidden from humans */}
            <input
                type="text"
                name="botcheck"
                value={botcheck}
                onChange={(e) => setBotcheck(e.target.value)}
                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />

            {/* From Field */}
            <div className="mb-4">
                <label htmlFor="contact-email" className="sr-only">
                    Your email
                </label>
                <input
                    id="contact-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'sending' || status === 'success'}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-cream/15 bg-cream/[0.04] px-4 py-3 font-mono text-sm text-cream placeholder:text-cream-muted focus:border-cream/40 focus:bg-cream/[0.07] focus:outline-none disabled:opacity-60"
                />
            </div>

            {/* Message Field with embedded button */}
            <div className="relative">
                <label htmlFor="contact-message" className="sr-only">
                    Your message
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === 'sending' || status === 'success'}
                    placeholder="Your message..."
                    className="w-full resize-none rounded-lg border border-cream/15 bg-cream/[0.04] px-4 py-3 pb-14 font-mono text-sm text-cream placeholder:text-cream-muted focus:border-cream/40 focus:bg-cream/[0.07] focus:outline-none disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={status === 'sending' || status === 'success'}
                    className="pressable absolute bottom-4 right-4 rounded-full bg-cream px-4 py-2 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === 'sending' ? 'Sending' : status === 'success' ? 'Sent' : 'Send'}
                </button>
            </div>

            {feedback && (
                <p
                    className={`mt-3 font-mono text-xs leading-relaxed ${
                        status === 'error' ? 'text-red-300' : 'text-cream'
                    }`}
                    role={status === 'error' ? 'alert' : 'status'}
                >
                    {feedback}
                </p>
            )}
        </form>
    );
};

// ============================================
// MID LAYER - Aurora ribbons (medium parallax)
// ============================================
const MidAurora: React.FC = () => {
    return (
        <div
            className="mid-layer absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 2, ['--aurora' as string]: 1 }}
        >
            {/* Primary green aurora ribbon 1 */}
            <div
                className="aurora-ribbon absolute bottom-0 left-[5%] w-[40%] h-[75%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(235, 230, 220, calc(0.02 * var(--aurora))) 30%,
            rgba(235, 230, 220, calc(0.07 * var(--aurora))) 60%,
            rgba(235, 230, 220, calc(0.16 * var(--aurora))) 100%)`,
                    filter: 'blur(60px)',
                    animation: 'auroraWave 10s ease-in-out infinite',
                    willChange: 'transform',
                }}
            />

            {/* Primary green aurora ribbon 2 */}
            <div
                className="aurora-ribbon absolute bottom-0 left-[25%] w-[45%] h-[85%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(212, 196, 168, calc(0.02 * var(--aurora))) 30%,
            rgba(212, 196, 168, calc(0.06 * var(--aurora))) 60%,
            rgba(212, 196, 168, calc(0.14 * var(--aurora))) 100%)`,
                    filter: 'blur(70px)',
                    animation: 'auroraWave 12s ease-in-out infinite reverse',
                    animationDelay: '-2s',
                    willChange: 'transform',
                }}
            />

            {/* Primary green aurora ribbon 3 */}
            <div
                className="aurora-ribbon absolute bottom-0 right-[5%] w-[35%] h-[65%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(125, 154, 104, calc(0.02 * var(--aurora))) 30%,
            rgba(125, 154, 104, calc(0.07 * var(--aurora))) 60%,
            rgba(125, 154, 104, calc(0.14 * var(--aurora))) 100%)`,
                    filter: 'blur(55px)',
                    animation: 'auroraWave 14s ease-in-out infinite',
                    animationDelay: '-4s',
                    willChange: 'transform',
                }}
            />

            {/* Animation keyframes */}
            <style>{`
        @keyframes cryoVentLeft {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.6; 
          }
          100% { 
            transform: translate(-25px, 2px) scale(1.5); 
            opacity: 0; 
          }
        }
        @keyframes cryoVentRight {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.6; 
          }
          100% { 
            transform: translate(25px, 2px) scale(1.5); 
            opacity: 0; 
          }
        }
        .cryo-particle {
          top: 0;
        }
        .cryo-left {
          animation: cryoVentLeft 3.5s ease-out infinite;
        }
        .cryo-right {
          animation: cryoVentRight 3.5s ease-out infinite;
        }
        @keyframes cryoVentDown {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.5; 
          }
          100% { 
            transform: translate(0, 20px) scale(1.3); 
            opacity: 0; 
          }
        }
        .cryo-down {
          animation: cryoVentDown 3s ease-out infinite;
        }
        @keyframes auroraWave {
          0%, 100% { 
            transform: translate3d(0, 0, 0) skewX(0deg) scaleY(1); 
          }
          25% { 
            transform: translate3d(24px, 0, 0) skewX(2deg) scaleY(1.04); 
          }
          50% { 
            transform: translate3d(-8px, 0, 0) skewX(-1.5deg) scaleY(0.97); 
          }
          75% { 
            transform: translate3d(-18px, 0, 0) skewX(1.5deg) scaleY(1.02); 
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-ribbon { animation: none !important; }
          .cryo-left, .cryo-right, .cryo-down { animation: none !important; opacity: 0.35; }
        }
      `}</style>
        </div>
    );
};

// ============================================
// HORIZON LAYER - Shared Parallax for Name + Button
// ============================================
const HorizonLayer: React.FC = () => {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 30 }}
        >
            {/* Name sits in the sky, just above the horizon limb */}
            <div className="horizon-name absolute bottom-[calc(15vh-0.45rem)] left-0 w-full text-center">
                <div className="relative inline-block">
                    <div className="absolute bottom-full left-0 right-0 mb-6 flex justify-center pointer-events-auto">
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="pressable group relative overflow-hidden rounded-full border border-cream/20 bg-cream/5 px-6 py-3 min-h-[44px] backdrop-blur-md hover:bg-cream/10"
                            style={{
                                transition:
                                    'background-color 220ms var(--ease-soft), border-color 220ms var(--ease-soft), transform 140ms var(--ease-out)',
                            }}
                        >
                            <div
                                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]"
                                aria-hidden="true"
                            />
                            <span className="flex items-center gap-3 font-serif text-base italic leading-[1.2] text-cream whitespace-nowrap">
                                Say hello
                                <svg
                                    className="h-4 w-4 opacity-70 transition-transform duration-200 ease-out group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </a>
                    </div>

                    <div className="mb-[-0.6rem] flex w-full justify-center">
                        <div className="relative flex h-10 w-6 items-end md:h-14 md:w-8">
                            <div
                                className="absolute bottom-0 left-0 h-full w-px"
                                style={{
                                    background: 'linear-gradient(180deg, transparent 0%, #1a1a1a 20%, #0a0a0a 100%)',
                                }}
                            />
                            <div className="absolute bottom-[40%] left-0 h-px w-1/2 bg-[#0a0a0a]" />
                            <svg
                                className="z-10 ml-auto h-[90%] w-[60%]"
                                viewBox="0 0 64 160"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M32 0 L40 30 L24 30 Z" fill="#0a0a0a" />
                                <rect x="24" y="30" width="16" height="35" fill="#0a0a0a" />
                                <rect x="22" y="65" width="20" height="4" fill="#0a0a0a" />
                                <path d="M22 69 L20 130 L44 130 L42 69 Z" fill="#0a0a0a" />
                                <rect x="18" y="130" width="28" height="8" fill="#0a0a0a" />
                                <path d="M18 138 L8 158 L18 150 Z" fill="#0a0a0a" />
                                <path d="M46 138 L56 158 L46 150 Z" fill="#0a0a0a" />
                                <ellipse cx="26" cy="145" rx="4" ry="6" fill="#0a0a0a" />
                                <ellipse cx="32" cy="147" rx="5" ry="8" fill="#0a0a0a" />
                                <ellipse cx="38" cy="145" rx="4" ry="6" fill="#0a0a0a" />
                            </svg>
                            <div className="absolute bottom-0 right-0 h-3 w-8 overflow-visible">
                                <span className="cryo-particle cryo-left absolute rounded-full bg-white/50 w-[2px] h-[2px]" style={{ left: '50%', animationDelay: '0s' }} />
                                <span className="cryo-particle cryo-left absolute rounded-full bg-white/40 w-[3px] h-[3px]" style={{ left: '40%', animationDelay: '1s' }} />
                                <span className="cryo-particle cryo-right absolute rounded-full bg-white/50 w-[2px] h-[2px]" style={{ left: '50%', animationDelay: '0.5s' }} />
                                <span className="cryo-particle cryo-right absolute rounded-full bg-white/40 w-[3px] h-[3px]" style={{ left: '60%', animationDelay: '1.5s' }} />
                                <span className="cryo-particle cryo-down absolute rounded-full bg-white/50 w-[2px] h-[2px]" style={{ left: '45%', animationDelay: '0.3s' }} />
                                <span className="cryo-particle cryo-down absolute rounded-full bg-white/40 w-[3px] h-[3px]" style={{ left: '55%', animationDelay: '0.9s' }} />
                                <span className="cryo-particle cryo-down absolute rounded-full bg-white/30 w-[2px] h-[2px]" style={{ left: '50%', animationDelay: '1.8s' }} />
                            </div>
                        </div>
                    </div>

                    <span className="block font-serif text-[clamp(3.5rem,14vw,9.5rem)] font-normal leading-[0.88] tracking-[-0.04em] text-cream/20">
                        Suraj
                    </span>
                    <span className="block font-serif text-[clamp(3.5rem,14vw,9.5rem)] font-normal leading-[0.88] tracking-[-0.04em] text-cream/20">
                        Sarkar
                    </span>
                </div>
            </div>

            {/* Planet limb: from the bottom of the screen up to just under the name */}
            <div className="absolute bottom-0 left-0 h-[15vh] min-h-[150px] lg:h-[18vh] lg:min-h-[180px] w-full">
                <svg
                    className="absolute inset-0 block h-full w-full"
                    viewBox="0 0 1440 400"
                    preserveAspectRatio="none"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                >
                    <path
                        d="M0,220 Q720,-80 1440,220 L1440,400 L0,400 Z"
                        fill="#0c0c0b"
                    />
                </svg>
                <div className="social-links absolute bottom-8 left-0 z-20 flex w-full flex-col items-center gap-3">
                    <span className="font-serif italic text-[10px] md:text-sm leading-[1.2] tracking-[0.15em] text-cream/55 pb-1 uppercase">
                        The expanded universe
                    </span>
                    <div className="flex justify-center gap-4 pointer-events-auto">
                        <a
                            href="https://github.com/surajsarkar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/40 hover:border-cream/50 hover:text-cream min-h-[44px] min-w-[44px]"
                            style={{ transition: 'color 220ms var(--ease-soft), border-color 220ms var(--ease-soft), transform 140ms var(--ease-out)' }}
                            aria-label="GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/surajsarkar0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/40 hover:border-cream/50 hover:text-cream min-h-[44px] min-w-[44px]"
                            style={{ transition: 'color 220ms var(--ease-soft), border-color 220ms var(--ease-soft), transform 140ms var(--ease-out)' }}
                            aria-label="LinkedIn"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                        <a
                            href="https://surajsarkar0.medium.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/40 hover:border-cream/50 hover:text-cream min-h-[44px] min-w-[44px]"
                            style={{ transition: 'color 220ms var(--ease-soft), border-color 220ms var(--ease-soft), transform 140ms var(--ease-out)' }}
                            aria-label="Medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

// ============================================
// NEAR LAYER - North Star + Content (fastest / fixed)
// ============================================
const NearContent: React.FC<{
    isStarHovered: boolean;
    onStarHover: (hovering: boolean) => void;
    onContact: () => void;
    onReboot: () => void;
}> = ({ isStarHovered, onStarHover, onContact, onReboot }) => {
    return (
        <div
            className="near-layer relative z-10 flex min-h-[100dvh] flex-col items-center justify-start pt-[12vh] md:pt-[14vh]"
        >
            <div className="mb-8 px-4 text-center">
                <h2
                    className="heading-line-2 mx-auto max-w-2xl font-serif text-[clamp(1.35rem,3.4vw,2.6rem)] font-normal leading-[1.25] tracking-[-0.02em] text-cream"
                >
                    If you need a hand building reliable backend systems or automating the boring stuff, feel free to say hello.
                </h2>
            </div>

            {/* North Star - positioned closer to heading */}
            <div className="north-star mt-2">
                <CinematicStar
                    isHovered={isStarHovered}
                    onClick={onContact}
                    onHover={onStarHover}
                />
            </div>
        </div>
    );
};

// ============================================
// CINEMATIC STAR
// ============================================
const CinematicStar: React.FC<{
    isHovered: boolean;
    onClick: () => void;
    onHover: (hovering: boolean) => void;
}> = ({ isHovered, onClick, onHover }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const hoverIntensity = useRef(0);
    const particlesRef = useRef<Array<{ angle: number; radius: number; speed: number; size: number; opacity: number }>>([]);

    useEffect(() => {
        const particles = [];
        for (let i = 0; i < 15; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 35 + Math.random() * 50,
                speed: 0.003 + Math.random() * 0.004,
                size: 1 + Math.random() * 1.5,
                opacity: 0.4 + Math.random() * 0.4,
            });
        }
        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        hoverIntensity.current = isHovered ? 1 : 0;
    }, [isHovered]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 280;
        canvas.width = size;
        canvas.height = size;
        const cx = size / 2;
        const cy = size / 2;
        let smoothHover = 0;

        const animate = () => {
            ctx.clearRect(0, 0, size, size);
            // Smooth hover blend — no hard cut when isHovered flips
            smoothHover += (hoverIntensity.current - smoothHover) * 0.08;
            const intensity = 1 + smoothHover * 0.8;
            const coreSize = 6 + smoothHover * 4;
            const rayLength = 60 + smoothHover * 30;

            // Outer halo
            const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * intensity);
            halo.addColorStop(0, `rgba(255, 255, 255, ${0.12 * intensity})`);
            halo.addColorStop(0.5, `rgba(200, 220, 255, ${0.05 * intensity})`);
            halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 0, size, size);

            // 4-pointed star rays
            ctx.save();
            ctx.translate(cx, cy);
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 4);
                const ray = ctx.createLinearGradient(0, 0, 0, rayLength);
                ray.addColorStop(0, `rgba(255, 255, 255, ${0.95 * intensity})`);
                ray.addColorStop(0.4, `rgba(200, 220, 255, ${0.4 * intensity})`);
                ray.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.beginPath();
                ctx.moveTo(-1.5, 0);
                ctx.lineTo(0, -rayLength);
                ctx.lineTo(1.5, 0);
                ctx.closePath();
                ctx.fillStyle = ray;
                ctx.fill();
            }
            ctx.restore();

            // Lens flares — fade with smoothHover
            if (smoothHover > 0.02) {
                ctx.save();
                ctx.globalAlpha = smoothHover;
                ctx.translate(cx, cy);

                const hFlare = ctx.createLinearGradient(-130, 0, 130, 0);
                hFlare.addColorStop(0, 'rgba(255, 255, 255, 0)');
                hFlare.addColorStop(0.45, 'rgba(200, 220, 255, 0.6)');
                hFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
                hFlare.addColorStop(0.55, 'rgba(200, 220, 255, 0.6)');
                hFlare.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = hFlare;
                ctx.fillRect(-130, -2.5, 260, 5);

                const vFlare = ctx.createLinearGradient(0, -130, 0, 130);
                vFlare.addColorStop(0, 'rgba(255, 255, 255, 0)');
                vFlare.addColorStop(0.45, 'rgba(200, 220, 255, 0.6)');
                vFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
                vFlare.addColorStop(0.55, 'rgba(200, 220, 255, 0.6)');
                vFlare.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = vFlare;
                ctx.fillRect(-2.5, -130, 5, 260);

                ctx.restore();
            }

            // Orbiting particles
            particlesRef.current.forEach(p => {
                p.angle += p.speed * (1 + smoothHover * 1.5);
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = cy + Math.sin(p.angle) * p.radius;
                ctx.beginPath();
                ctx.arc(x, y, p.size * (1 + smoothHover * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * intensity})`;
                ctx.fill();
            });

            // Bright core
            const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 2);
            core.addColorStop(0, '#ffffff');
            core.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
            core.addColorStop(1, 'rgba(200, 220, 255, 0.3)');
            ctx.beginPath();
            ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = core;
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    return (
        <button
            className="relative cursor-pointer border-none bg-transparent p-0"
            style={{
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 280ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            aria-label="Say hello"
        >
            <canvas ref={canvasRef} style={{ width: '100px', height: '100px' }} />
            <span
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 font-serif text-sm italic leading-[1.2] transition-[opacity,color] duration-300 ease-out ${
                    isHovered ? 'text-cream opacity-100' : 'text-cream/40 opacity-0'
                }`}
            >
                Say hello
            </span>
        </button>
    );
};

// ============================================
// MAIN EVENT HORIZON COMPONENT
// ============================================
const EventHorizon: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const midLayerRef = useRef<HTMLDivElement>(null);
    const [isStarHovered, setIsStarHovered] = useState(false);

    // Parallax + entrances — transform/opacity only, no per-frame React state
    useEffect(() => {
        if (!sectionRef.current) return;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            if (reduceMotion) {
                gsap.set(
                    ['.near-layer .heading-line-2', '.near-layer .north-star', '.horizon-name', '.social-links'],
                    { opacity: 1, y: 0, scale: 1, autoAlpha: 1 }
                );
                return;
            }

            // Far layer - slowest parallax
            gsap.to('.far-layer', {
                y: -40,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.1,
                },
            });

            // Mid layer - medium parallax
            gsap.to('.mid-layer', {
                y: -100,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.75,
                },
            });

            // Aurora intensity via CSS var (no React re-render)
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 0.8,
                onUpdate: (self) => {
                    const el = sectionRef.current?.querySelector('.mid-layer') as HTMLElement | null;
                    if (el) {
                        el.style.setProperty('--aurora', String(0.55 + self.progress * 1.35));
                    }
                },
            });

            gsap.fromTo(
                '.near-layer .heading-line-2',
                { opacity: 0, y: 56, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.05,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 56%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Never scale(0) — start near-visible
            gsap.fromTo(
                '.near-layer .north-star',
                { opacity: 0, scale: 0.92 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 48%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            gsap.fromTo(
                '.horizon-name',
                { y: 64, autoAlpha: 0, scale: 0.96 },
                {
                    y: 0,
                    autoAlpha: 1,
                    scale: 1,
                    duration: 1.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            gsap.fromTo(
                '.social-links',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 38%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleStarHover = useCallback((hovering: boolean) => {
        setIsStarHovered(hovering);
    }, []);

    const handleReboot = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[100dvh] overflow-hidden"
            style={{ backgroundColor: 'transparent' }}
            id="contact"
            aria-label="Contact"
        >
            {/* FAR LAYER — parallax shell (shared WebGL cosmos lives on App) */}
            <div className="far-layer pointer-events-none absolute inset-0" aria-hidden="true" />

            {/* MID LAYER - Aurora ribbons */}
            <div ref={midLayerRef} className="absolute inset-0">
                <MidAurora />
                <HorizonLayer />
            </div>

            {/* NEAR LAYER - Content */}
            <NearContent
                isStarHovered={isStarHovered}
                onStarHover={handleStarHover}
                onContact={() => {
                    window.location.href = `mailto:${CONTACT_EMAIL}`;
                }}
                onReboot={handleReboot}
            />

        </section>
    );
};

export default EventHorizon;

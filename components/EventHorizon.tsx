import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// FAR LAYER - Very dim, tiny stars (slowest parallax)
// ============================================
const FarStars: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const stars: HTMLDivElement[] = [];
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Create many tiny, dim stars
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 1.2 + 0.3; // Very small
            const x = Math.random() * width;
            const y = Math.random() * height;
            const opacity = 0.1 + Math.random() * 0.2; // Very dim

            star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #ffffff;
        border-radius: 50%;
        opacity: ${opacity};
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
      `;

            container.appendChild(star);
            stars.push(star);
        }

        return () => stars.forEach(star => star.remove());
    }, []);

    return (
        <div
            ref={containerRef}
            className="far-layer absolute inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
};

// ============================================
// MID LAYER - Aurora ribbons (medium parallax)
// ============================================
const MidAurora: React.FC<{ intensity: number }> = ({ intensity }) => {
    return (
        <div
            className="mid-layer absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 2 }}
        >
            {/* Primary green aurora ribbon 1 */}
            <div
                className="absolute bottom-0 left-[5%] w-[40%] h-[75%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(83, 210, 45, ${0.03 * intensity}) 30%,
            rgba(83, 210, 45, ${0.12 * intensity}) 60%,
            rgba(83, 210, 45, ${0.3 * intensity}) 100%)`,
                    filter: 'blur(60px)',
                    animation: 'auroraWave 8s ease-in-out infinite',
                }}
            />

            {/* Primary green aurora ribbon 2 */}
            <div
                className="absolute bottom-0 left-[25%] w-[45%] h-[85%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(83, 210, 45, ${0.02 * intensity}) 30%,
            rgba(83, 210, 45, ${0.1 * intensity}) 60%,
            rgba(83, 210, 45, ${0.25 * intensity}) 100%)`,
                    filter: 'blur(70px)',
                    animation: 'auroraWave 10s ease-in-out infinite reverse',
                    animationDelay: '-2s',
                }}
            />

            {/* Primary green aurora ribbon 3 */}
            <div
                className="absolute bottom-0 right-[5%] w-[35%] h-[65%]"
                style={{
                    background: `linear-gradient(180deg, 
            transparent 0%, 
            rgba(83, 210, 45, ${0.04 * intensity}) 30%,
            rgba(83, 210, 45, ${0.15 * intensity}) 60%,
            rgba(83, 210, 45, ${0.35 * intensity}) 100%)`,
                    filter: 'blur(55px)',
                    animation: 'auroraWave 12s ease-in-out infinite',
                    animationDelay: '-4s',
                }}
            />

            {/* Curved horizon */}
            <svg
                className="absolute bottom-0 w-full h-40"
                viewBox="0 0 1440 160"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="horizonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0, 0, 0, 0)" />
                        <stop offset="30%" stopColor="rgba(0, 0, 0, 0.6)" />
                        <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,160 Q720,-20 1440,160 L1440,160 L0,160 Z"
                    fill="url(#horizonGrad)"
                />
            </svg>

            {/* Name in the horizon curve */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
                <span className="block text-[10vw] md:text-[6rem] lg:text-[7rem] font-black text-white/90 tracking-tighter leading-none">
                    SURAJ
                </span>
                <span className="block text-[10vw] md:text-[6rem] lg:text-[7rem] font-black text-white/90 tracking-tighter leading-none">
                    SARKAR
                </span>
            </div>

            {/* Horizon heading */}
            <span
                className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[13px] text-gray-400 tracking-[0.3em] uppercase"
            >
                THE EXPANDED UNIVERSE
            </span>

            {/* Wavy animation keyframes */}
            <style>{`
        @keyframes auroraWave {
          0%, 100% { 
            transform: translateX(0) skewX(0deg) scaleY(1); 
          }
          25% { 
            transform: translateX(30px) skewX(3deg) scaleY(1.05); 
          }
          50% { 
            transform: translateX(-10px) skewX(-2deg) scaleY(0.95); 
          }
          75% { 
            transform: translateX(-25px) skewX(2deg) scaleY(1.03); 
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
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
            className="near-layer relative z-10 flex flex-col items-center justify-start min-h-screen pt-[15vh]"
        >
            {/* The Heading */}
            <div className="text-center mb-8 px-4">
                {/* Line 1 - The Foundation */}
                <p className="heading-line-1 text-xl md:text-2xl lg:text-3xl font-medium text-gray-500 mb-4 tracking-wide">
                    The system is ready.
                </p>
                {/* Line 2 - The Impact */}
                <h2
                    className="heading-line-2 text-[8vw] md:text-[5rem] lg:text-[6.5rem] xl:text-[8rem] font-black text-white tracking-tighter"
                    style={{
                        textShadow: '0 0 80px rgba(255, 255, 255, 0.2)',
                        lineHeight: 1,
                    }}
                >
                    Where are we going?
                    <span
                        className="inline-block w-[3px] md:w-[4px] h-[0.8em] bg-white ml-2 align-middle"
                        style={{ animation: 'blink 1s step-end infinite' }}
                    />
                </h2>
            </div>

            {/* North Star - positioned closer to heading */}
            <div className="north-star mt-4">
                <CinematicStar
                    isHovered={isStarHovered}
                    onClick={onContact}
                    onHover={onStarHover}
                />
            </div>

            {/* Contact Form - Glassmorphism - positioned near bottom */}
            <div
                className="contact-form absolute bottom-[12rem] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20"
            >
                <div
                    className="p-4 rounded-xl border border-white/10"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {/* To Field - Email in pill */}
                    <div className="mb-4 flex items-center gap-2">
                        <span className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary font-mono text-sm">
                            hello@surajsarkar.dev
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText('hello@surajsarkar.dev');
                            }}
                            className="p-2 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:border-primary/50 transition-all"
                            aria-label="Copy email"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* From Field */}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {/* Message Field with embedded button */}
                    <div className="relative">
                        <textarea
                            rows={5}
                            placeholder="Your message..."
                            className="w-full px-4 py-3 pb-14 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all resize-none"
                        />
                        {/* Send Button - inside message box */}
                        <button
                            type="button"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('dobby-show-popper'));
                            }}
                            className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary font-mono text-xs uppercase tracking-wider hover:bg-primary/30 hover:border-primary/50 transition-all"
                        >
                            ▲ Transmit
                        </button>
                    </div>
                </div>
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
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 280;
        canvas.width = size;
        canvas.height = size;
        const cx = size / 2;
        const cy = size / 2;

        const animate = () => {
            ctx.clearRect(0, 0, size, size);
            const intensity = isHovered ? 1.8 : 1;
            const coreSize = isHovered ? 10 : 6;
            const rayLength = isHovered ? 90 : 60;

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

            // Lens flares on hover
            if (isHovered) {
                ctx.save();
                ctx.translate(cx, cy);

                // Horizontal
                const hFlare = ctx.createLinearGradient(-130, 0, 130, 0);
                hFlare.addColorStop(0, 'rgba(255, 255, 255, 0)');
                hFlare.addColorStop(0.45, 'rgba(200, 220, 255, 0.6)');
                hFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
                hFlare.addColorStop(0.55, 'rgba(200, 220, 255, 0.6)');
                hFlare.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = hFlare;
                ctx.fillRect(-130, -2.5, 260, 5);

                // Vertical
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
                p.angle += p.speed * (isHovered ? 2.5 : 1);
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = cy + Math.sin(p.angle) * p.radius;
                ctx.beginPath();
                ctx.arc(x, y, p.size * (isHovered ? 1.3 : 1), 0, Math.PI * 2);
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
    }, [isHovered]);

    return (
        <button
            className="relative cursor-pointer border-none bg-transparent p-0 transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            aria-label="Contact me"
        >
            <canvas ref={canvasRef} style={{ width: '100px', height: '100px' }} />
            <span
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono uppercase tracking-widest transition-all duration-500 ${isHovered ? 'opacity-100 text-primary' : 'opacity-0 text-white/40'
                    }`}
            >
                ▲ transmit
            </span>
        </button>
    );
};

// ============================================
// MAIN EVENT HORIZON COMPONENT
// ============================================
const EventHorizon: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const farLayerRef = useRef<HTMLDivElement>(null);
    const midLayerRef = useRef<HTMLDivElement>(null);
    const [isStarHovered, setIsStarHovered] = useState(false);
    const [auroraIntensity, setAuroraIntensity] = useState(1);

    // Parallax scroll effect
    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Far layer - moves slowest (barely moves)
            gsap.to('.far-layer', {
                y: -50,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            // Mid layer - moves at medium speed
            gsap.to('.mid-layer', {
                y: -120,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                },
            });

            // Aurora intensity based on scroll progress
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top 80%',
                end: 'top 20%',
                scrub: true,
                onUpdate: (self) => {
                    setAuroraIntensity(0.5 + self.progress * 1.5);
                },
            });

            // Heading entrance - Line 1 (smaller text)
            gsap.fromTo(
                '.near-layer .heading-line-1',
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Heading entrance - Line 2 (big text)
            gsap.fromTo(
                '.near-layer .heading-line-2',
                { opacity: 0, y: 80, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 55%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // North Star entrance - scale up with bounce
            gsap.fromTo(
                '.near-layer .north-star',
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 45%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Social links entrance - slide up
            gsap.fromTo(
                '.near-layer .social-links',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 35%',
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

    const handleContact = () => {
        window.location.href = 'mailto:hello@surajsarkar.dev';
    };

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[115vh] overflow-hidden"
            style={{ backgroundColor: '#030306' }}
            id="contact"
        >
            {/* FAR LAYER - Dim stars */}
            <div ref={farLayerRef} className="absolute inset-0">
                <FarStars />
            </div>

            {/* MID LAYER - Aurora ribbons */}
            <div ref={midLayerRef} className="absolute inset-0">
                <MidAurora intensity={auroraIntensity} />
            </div>

            {/* NEAR LAYER - Content */}
            <NearContent
                isStarHovered={isStarHovered}
                onStarHover={handleStarHover}
                onContact={handleContact}
                onReboot={handleReboot}
            />

            {/* Social Links - positioned at section bottom */}
            <div className="social-links absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-5">
                <a
                    href="https://github.com/surajsarkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white/90 hover:border-white/50 transition-all"
                    aria-label="GitHub"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </a>
                <a
                    href="https://linkedin.com/in/surajsarkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white/90 hover:border-white/50 transition-all"
                    aria-label="LinkedIn"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                </a>
                <a
                    href="https://medium.com/@surajsarkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white/90 hover:border-white/50 transition-all"
                    aria-label="Medium"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                    </svg>
                </a>
            </div>
        </section>
    );
};

export default EventHorizon;

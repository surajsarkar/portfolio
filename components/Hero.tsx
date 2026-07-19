import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  // Mouse-driven glow + text spotlight via CSS vars (no React re-render)
  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const glow = glowRef.current;
    if (!section || !heading || !glow) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let targetX = 0.5;
    let targetY = 0.8;
    let currentX = 0.5;
    let currentY = 0.8;
    let textX = 50;
    let textY = 50;
    let targetTextX = 50;
    let targetTextY = 50;
    let hovering = false;
    let raf = 0;

    const tick = () => {
      const lerp = 0.08;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;
      textX += (targetTextX - textX) * lerp;
      textY += (targetTextY - textY) * lerp;

      const pull = hovering ? 0.28 : 0.06;
      const glowX = 0.5 + (currentX - 0.5) * pull;
      const glowY = 0.8 + (currentY - 0.8) * pull;
      const intensity = hovering ? 0.14 : 0.07;

      glow.style.background = `
        radial-gradient(
          1100px circle at ${glowX * 100}% ${glowY * 100}%,
          rgba(83, 210, 45, ${intensity}),
          transparent 68%
        )
      `;

      heading.style.backgroundImage = `radial-gradient(circle at ${textX}% ${textY}%, #53d22d 0%, #f4f4f5 28%, #1a1a22 100%)`;

      raf = requestAnimationFrame(tick);
    };

    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
    } else {
      glow.style.background = `radial-gradient(1100px circle at 50% 80%, rgba(83, 210, 45, 0.07), transparent 68%)`;
      heading.style.backgroundImage = `radial-gradient(circle at 50% 50%, #53d22d 0%, #f4f4f5 28%, #1a1a22 100%)`;
    }

    const onMove = (e: MouseEvent) => {
      if (reduceMotion) return;
      const rect = section.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
      hovering = true;

      const hRect = heading.getBoundingClientRect();
      targetTextX = ((e.clientX - hRect.left) / Math.max(hRect.width, 1)) * 100;
      targetTextY = ((e.clientY - hRect.top) / Math.max(hRect.height, 1)) * 100;
    };

    const onLeave = () => {
      hovering = false;
      targetX = 0.5;
      targetY = 0.8;
      targetTextX = 50;
      targetTextY = 50;
    };

    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Staggered entrance — transform/opacity only
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = [badgeRef.current, headingRef.current, subRef.current].filter(Boolean) as HTMLElement[];

    if (reduceMotion) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0, y: 28 });
      gsap.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.08,
      });
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
        delay: 0.2,
      });
      gsap.to(subRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.38,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 select-none cosmos-vignette"
      aria-label="Introduction"
    >
      {/* Interactive cursor glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          transition: 'opacity 0.8s var(--ease-out)',
        }}
      />

      {/* Deep ambient floor light */}
      <div
        className="pointer-events-none absolute bottom-[-12%] left-1/2 z-[1] h-[55vh] w-[120vw] -translate-x-1/2 rounded-full bg-primary/10 opacity-30 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-[95vw] flex-col items-center text-center">
        <div
          ref={badgeRef}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 opacity-0"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary md:text-xs">
            Available for freelance
          </span>
        </div>

        <h1
          ref={headingRef}
          className="mb-6 max-w-6xl bg-clip-text text-[clamp(2.4rem,7.5vw,7.5rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] opacity-0"
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '160% 160%',
            backgroundPosition: 'center',
          }}
        >
          crafting intelligence{' '}
          <br className="hidden md:block" />
          from{' '}
          <span
            style={{
              color: '#53d22d',
              WebkitTextFillColor: '#53d22d',
            }}
          >
            backend to behaviour
          </span>
          .
        </h1>

        <p
          ref={subRef}
          className="max-w-xl text-base font-medium leading-relaxed tracking-wide text-zinc-400 opacity-0 md:text-lg"
        >
          I build systems that make AI work in production.
        </p>
      </div>
    </section>
  );
};

export default Hero;

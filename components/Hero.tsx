import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Mouse-driven glow via CSS (no React re-render)
  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let targetX = 0.28;
    let targetY = 0.72;
    let currentX = 0.28;
    let currentY = 0.72;
    let hovering = false;
    let raf = 0;

    const tick = () => {
      const lerp = 0.08;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      const pull = hovering ? 0.32 : 0.08;
      const glowX = 0.28 + (currentX - 0.28) * pull;
      const glowY = 0.72 + (currentY - 0.72) * pull;
      const intensity = hovering ? 0.12 : 0.06;

      glow.style.background = `
        radial-gradient(
          900px circle at ${glowX * 100}% ${glowY * 100}%,
          rgba(235, 230, 220, ${intensity}),
          transparent 68%
        )
      `;

      raf = requestAnimationFrame(tick);
    };

    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
    } else {
      glow.style.background = `radial-gradient(900px circle at 28% 72%, rgba(235, 230, 220, 0.06), transparent 68%)`;
    }

    const onMove = (e: MouseEvent) => {
      if (reduceMotion) return;
      const rect = section.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
      hovering = true;
    };

    const onLeave = () => {
      hovering = false;
      targetX = 0.28;
      targetY = 0.72;
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
    const els = [badgeRef.current, headingRef.current, copyRef.current].filter(Boolean) as HTMLElement[];

    if (reduceMotion) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0, y: 24 });
      gsap.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.06,
      });
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
        delay: 0.16,
      });
      gsap.to(copyRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.32,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden px-6 pb-16 pt-24 cosmos-vignette md:px-12 md:pb-24"
      aria-label="Introduction"
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-[-18%] left-[-10%] z-[1] h-[50vh] w-[70vw] rounded-full bg-cream/10 opacity-40 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <p
          ref={badgeRef}
          className="mb-5 font-serif text-base italic leading-[1.2] text-cream-muted opacity-0 pb-1 md:text-lg"
        >
          Available for freelance
        </p>

        <h1
          ref={headingRef}
          className="max-w-5xl font-serif text-[clamp(2.75rem,8vw,7.25rem)] font-normal leading-[1.02] tracking-[-0.03em] text-cream opacity-0"
        >
          Backend systems
          <br />
          and local AI.
        </h1>

        <div
          ref={copyRef}
          className="mt-8 flex max-w-xl flex-col items-start gap-7 opacity-0"
        >
          <p className="text-base leading-relaxed text-cream-muted md:text-lg">
            I work from India, building quiet software that handles the tedious work so people don&apos;t have to think about it.
          </p>
          <a
            href="#projects"
            className="pressable group inline-flex items-center gap-3 text-sm font-medium text-cream"
          >
            Selected work
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

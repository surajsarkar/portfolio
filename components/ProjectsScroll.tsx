import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectStackCard from './ProjectStackCard';
import ConstellationNetwork from './ConstellationNetwork';
import projectsData from '../src/data/projects.json';
import { Project } from '../types';

gsap.registerPlugin(ScrollTrigger);

const projects: Project[] = projectsData as Project[];

const getConstellationPositions = (w: number, h: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.32;
  return [
    { x: cx, y: cy - radius * 0.75 },
    { x: cx - radius, y: cy + radius * 0.55 },
    { x: cx + radius, y: cy + radius * 0.55 },
  ];
};

/**
 * Sticky project stack driven entirely by GSAP + ScrollTrigger.
 * Card transforms update via gsap.set (no React re-renders per frame).
 */
const ProjectsScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const constellationWrapRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef(getConstellationPositions(window.innerWidth, window.innerHeight));
  const networkRef = useRef<{ setProgress: (p: number, active: boolean) => void } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = () => cardRefs.current.filter(Boolean) as HTMLDivElement[];

    const updatePositions = () => {
      positionsRef.current = getConstellationPositions(window.innerWidth, window.innerHeight);
    };
    updatePositions();
    window.addEventListener('resize', updatePositions);

    // Initial off-screen state
    cards().forEach((card) => {
      gsap.set(card, {
        y: window.innerHeight,
        x: 0,
        rotation: 0,
        scale: 0.92,
        opacity: 0,
        force3D: true,
      });
    });

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, scale: 1, force3D: true });
    }

    const applyFrame = (progress: number) => {
      const n = projects.length;
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const bar = progressBarRef.current;

      // Phases
      // 0–0.06 entering title
      // 0.06–0.72 stacking
      // 0.72–1.0 constellation
      const enterEnd = 0.06;
      const stackEnd = 0.72;

      if (bar) {
        gsap.set(bar, { scaleX: progress, force3D: true });
      }

      if (progress < enterEnd) {
        if (title) gsap.set(title, { opacity: 1, scale: 1 });
        if (subtitle) gsap.set(subtitle, { opacity: 1 });
        networkRef.current?.setProgress(0, false);
        cards().forEach((card) => {
          gsap.set(card, {
            y: window.innerHeight * 0.95,
            x: 0,
            rotation: 0,
            scale: 0.92,
            opacity: 0,
            zIndex: 10,
          });
        });
        return;
      }

      if (progress < stackEnd) {
        const stackingProgress = (progress - enterEnd) / (stackEnd - enterEnd);
        const activeIndex = Math.min(Math.floor(stackingProgress * n), n - 1);

        // Title recedes behind stack
        const titleFade = Math.min(1, stackingProgress * 1.6);
        if (title) {
          gsap.set(title, {
            opacity: Math.max(0.12, 1 - titleFade),
            scale: Math.max(0.32, 1 - stackingProgress * 0.65),
          });
        }
        if (subtitle) {
          gsap.set(subtitle, { opacity: Math.max(0, 1 - stackingProgress * 3.2) });
        }
        networkRef.current?.setProgress(0, false);

        cards().forEach((card, index) => {
          const cardProgress = stackingProgress * n - index;

          if (cardProgress < 0) {
            gsap.set(card, {
              y: window.innerHeight * 0.9,
              x: 0,
              rotation: 0,
              opacity: 0,
              scale: 0.92,
              zIndex: index + 10,
            });
          } else if (cardProgress < 1) {
            // Smooth ease into view (ease-out feel via cubic)
            const t = cardProgress;
            const eased = 1 - Math.pow(1 - t, 3);
            gsap.set(card, {
              y: (1 - eased) * window.innerHeight * 0.72,
              x: 0,
              rotation: 0,
              opacity: eased,
              scale: 0.94 + eased * 0.06,
              zIndex: 200,
            });
          } else {
            const stackPos = activeIndex - index;
            const stackOffset = stackPos * 28;
            const xOffset = stackPos * (stackPos % 2 === 0 ? 8 : -8);
            const rotation = stackPos * (stackPos % 2 === 0 ? 1.6 : -1.6);
            gsap.set(card, {
              y: stackOffset,
              x: xOffset,
              rotation,
              opacity: 1,
              scale: 1 - stackPos * 0.018,
              zIndex: 100 + index,
            });
          }
        });
        return;
      }

      // Constellation phase
      const cProg = (progress - stackEnd) / (1 - stackEnd);
      const eased = 1 - Math.pow(1 - cProg, 2.4);
      const positions = positionsRef.current;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      if (title) gsap.set(title, { opacity: 0.08, scale: 0.3 });
      if (subtitle) gsap.set(subtitle, { opacity: 0 });
      networkRef.current?.setProgress(Math.max(0, (eased - 0.25) / 0.75), eased > 0.25);

      cards().forEach((card, index) => {
        const target = positions[index];
        if (!target) return;
        gsap.set(card, {
          x: (target.x - centerX) * eased,
          y: (target.y - centerY) * eased,
          rotation: 0,
          scale: 0.36 + (1 - eased) * 0.32,
          opacity: 1,
          zIndex: 20 + index,
        });
      });
    };

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        // Show first card static; skip scrub cinema
        const first = cards()[0];
        if (first) {
          gsap.set(first, { y: 0, opacity: 1, scale: 1, x: 0 });
        }
        cards().slice(1).forEach((c, i) => {
          gsap.set(c, { y: (i + 1) * 24, x: (i % 2 === 0 ? 10 : -10), opacity: 0.85, scale: 0.96 });
        });
        if (titleRef.current) gsap.set(titleRef.current, { opacity: 0.2, scale: 0.5 });
        return;
      }

      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65, // inertial feel — smoother than 1
        pin: sticky,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyFrame(self.progress),
        onRefresh: (self) => applyFrame(self.progress),
      });

      // Title entrance when section approaches
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, container);

    // First paint
    applyFrame(0);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="projects"
      className="relative"
      style={{ height: '420vh' }}
      aria-label="Projects"
    >
      <div
        ref={stickyRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-background-dark/50"
      >
        {/* Soft top continuity glow from hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-[-18%] h-[45vh] w-[110vw] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(83, 210, 45, 0.07) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          aria-hidden="true"
        />

        {/* Progress rail */}
        <div
          className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/5"
          aria-hidden="true"
        >
          <div
            ref={progressBarRef}
            className="h-full origin-left bg-primary/70"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* Section title */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
        >
          <div className="text-center px-4">
            <h2
              className="text-[clamp(2.5rem,8vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.03em] text-white"
              style={{
                textShadow:
                  '0 0 80px rgba(255,255,255,0.22), 0 4px 30px rgba(0,0,0,0.85)',
              }}
            >
              Core
              <br />
              systems
            </h2>
            <p
              ref={subtitleRef}
              className="mt-5 font-mono text-sm uppercase tracking-[0.22em] text-zinc-500 md:text-base"
            >
              Selected production work
            </p>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={cardsWrapRef}
          className="absolute inset-0 z-10 flex items-center justify-center is-scrubbing"
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="absolute will-change-transform"
            >
              <ProjectStackCard
                project={project}
                index={index}
                totalCards={projects.length}
                isActive={false}
              />
            </div>
          ))}
        </div>

        {/* Constellation lines (imperative progress) */}
        <div ref={constellationWrapRef} className="pointer-events-none absolute inset-0 z-[15]">
          <ConstellationNetworkBridge
            positionsRef={positionsRef}
            networkRef={networkRef}
          />
        </div>
      </div>
    </section>
  );
};

/** Thin bridge so constellation can update without parent re-renders */
const ConstellationNetworkBridge: React.FC<{
  positionsRef: React.MutableRefObject<{ x: number; y: number }[]>;
  networkRef: React.MutableRefObject<{ setProgress: (p: number, active: boolean) => void } | null>;
}> = ({ positionsRef, networkRef }) => {
  const [state, setState] = React.useState({ progress: 0, active: false, positions: positionsRef.current });

  useEffect(() => {
    networkRef.current = {
      setProgress: (p, active) => {
        setState((prev) => {
          // Throttle React updates: only when active flips or progress jumps ~4%
          if (
            prev.active === active &&
            Math.abs(prev.progress - p) < 0.04 &&
            p !== 0 &&
            p !== 1
          ) {
            return prev;
          }
          return { progress: p, active, positions: positionsRef.current };
        });
      },
    };
    return () => {
      networkRef.current = null;
    };
  }, [networkRef, positionsRef]);

  return (
    <ConstellationNetwork
      positions={state.positions}
      isActive={state.active}
      progress={state.progress}
    />
  );
};

export default ProjectsScroll;

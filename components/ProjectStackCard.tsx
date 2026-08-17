import React, { useCallback, useRef, useState } from 'react';
import { Project } from '../types';

interface ProjectStackCardProps {
  project: Project;
  index: number;
  totalCards: number;
  isActive: boolean;
}

/** Premium ease — Ionic / Apple drawer curve */
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const ProjectStackCard: React.FC<ProjectStackCardProps> = ({
  project,
  index,
  totalCards,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (project.gif) setShowGif(true);
    window.dispatchEvent(
      new CustomEvent('dobby-set-expression', {
        detail: { expression: project.expression },
      })
    );
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowGif(false);
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
    window.dispatchEvent(
      new CustomEvent('dobby-set-expression', {
        detail: { expression: 'neutral' },
      })
    );
  };

  // Cursor spotlight — no React re-render
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const shell = shellRef.current;
    const spot = spotlightRef.current;
    if (!shell || !spot) return;
    const rect = shell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spot.style.opacity = '1';
    spot.style.background = `radial-gradient(
      520px circle at ${x}px ${y}px,
      rgba(83, 210, 45, 0.14),
      transparent 55%
    )`;
  }, []);

  return (
    /* ── Outer shell (double-bezel tray) ── */
    <article
      ref={shellRef}
      className="project-stack-card group relative h-[min(88dvh,860px)] w-[min(96vw,1320px)] p-1.5 md:p-2"
      style={{
        borderRadius: '2rem',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 42%, rgba(83,210,45,0.04) 100%)',
        boxShadow: isHovered
          ? '0 40px 100px -32px rgba(5,5,8,0.92), 0 0 0 1px rgba(255,255,255,0.1), 0 0 80px -20px rgba(83,210,45,0.12)'
          : '0 28px 70px -28px rgba(5,5,8,0.88), 0 0 0 1px rgba(255,255,255,0.06)',
        transform: isHovered ? 'scale(1.012) translateY(-4px)' : 'scale(1) translateY(0)',
        transition: `transform 700ms ${EASE}, box-shadow 700ms ${EASE}`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* ── Inner core ── */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: 'calc(2rem - 0.375rem)',
          background: '#07070c',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
        }}
      >
        {/* Media layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${showGif && project.gif ? project.gif : project.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: isHovered ? 'scale(1.055)' : 'scale(1)',
            filter: isHovered ? 'brightness(0.68) saturate(1.08)' : 'brightness(0.48) saturate(0.92)',
            transition: `transform 900ms ${EASE}, filter 700ms ${EASE}`,
          }}
          role="img"
          aria-label={`${project.title} preview`}
        />

        {/* Atmospheric scrims */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(7,7,12,0.55) 0%, transparent 32%, transparent 48%, rgba(7,7,12,0.75) 72%, rgba(7,7,12,0.96) 100%),
              linear-gradient(90deg, rgba(7,7,12,0.45) 0%, transparent 40%, transparent 60%, rgba(7,7,12,0.35) 100%),
              radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, rgba(7,7,12,0.7) 100%)
            `,
          }}
        />

        {/* Cursor spotlight (GPU) */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            opacity: 0,
            transition: `opacity 400ms ${EASE}`,
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />

        {/* Inner hairline ring */}
        <div
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            borderRadius: 'inherit',
            boxShadow: isHovered
              ? 'inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.2)'
              : 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: `box-shadow 500ms ${EASE}`,
          }}
          aria-hidden="true"
        />

        {/* Top meta row */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-4 p-5 md:p-7">
          {/* Index pill */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/70 tabular-nums md:text-[11px]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              style={{
                boxShadow: isHovered ? '0 0 10px rgba(83,210,45,0.8)' : '0 0 0 transparent',
                transition: `box-shadow 500ms ${EASE}`,
              }}
              aria-hidden="true"
            />
            {String(index + 1).padStart(2, '0')}
            <span className="text-white/30">/</span>
            {String(totalCards).padStart(2, '0')}
          </span>

          {/* Live status chip */}
          <span
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary/90 sm:inline-flex md:text-[11px]"
            style={{
              background: 'rgba(83,210,45,0.08)',
              boxShadow:
                'inset 0 1px 0 rgba(83,210,45,0.15), 0 0 0 1px rgba(83,210,45,0.18)',
            }}
          >
            Core system
          </span>
        </div>

        {/* Bottom content island */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6">
          <div
            className="relative overflow-hidden p-5 md:p-7"
            style={{
              borderRadius: '1.35rem',
              background:
                'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(12,12,18,0.72) 45%, rgba(8,8,12,0.88) 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)',
              transform: isHovered ? 'translateY(0)' : 'translateY(2px)',
              transition: `transform 700ms ${EASE}`,
            }}
          >
            {/* Glass sheen */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 52%, transparent 60%)',
                transform: isHovered ? 'translateX(12%)' : 'translateX(-30%)',
                transition: `transform 900ms ${EASE}`,
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <h3
                className="mb-3 max-w-4xl text-[clamp(1.75rem,4.8vw,4.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white"
                style={{
                  textShadow: '0 2px 24px rgba(0,0,0,0.55)',
                }}
              >
                {project.title}
              </h3>

              <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-zinc-300/90 md:text-base md:leading-relaxed">
                {project.description}
              </p>

              {/* Tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 font-mono text-[11px] tracking-wide text-white/70 md:text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.07)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Island CTAs — button-in-button trailing icon */}
              <div className="flex flex-wrap items-center gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta inline-flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-semibold text-[#050508] active:scale-[0.98]"
                    style={{
                      background:
                        'linear-gradient(135deg, #6ee04a 0%, #53d22d 50%, #3fb020 100%)',
                      boxShadow:
                        '0 8px 28px -8px rgba(83,210,45,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
                      transition: `transform 160ms ${EASE}, box-shadow 400ms ${EASE}`,
                    }}
                  >
                    <span>View source</span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px group-hover/cta:scale-105"
                      style={{
                        background: 'rgba(5,5,8,0.14)',
                        transitionTimingFunction: EASE,
                      }}
                      aria-hidden="true"
                    >
                      {/* Light arrow ↗ */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </span>
                  </a>
                )}

                {project.article && (
                  <a
                    href={project.article}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta inline-flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-semibold text-white/90 active:scale-[0.98]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                      transition: `transform 160ms ${EASE}, background 400ms ${EASE}, box-shadow 400ms ${EASE}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <span>Read article</span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px group-hover/cta:scale-105"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        transitionTimingFunction: EASE,
                      }}
                      aria-hidden="true"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectStackCard;

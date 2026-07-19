import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectStackCardProps {
  project: Project;
  index: number;
  totalCards: number;
  isActive: boolean;
}

const ProjectStackCard: React.FC<ProjectStackCardProps> = ({
  project,
  index,
  totalCards,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showGif, setShowGif] = useState(false);

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
    window.dispatchEvent(
      new CustomEvent('dobby-set-expression', {
        detail: { expression: 'neutral' },
      })
    );
  };

  return (
    <article
      className="project-stack-card relative h-[min(88dvh,860px)] w-[min(96vw,1320px)] overflow-hidden rounded-[1.75rem] bg-zinc-950"
      style={{
        border: `1px solid ${isHovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isHovered
          ? '0 32px 90px -28px rgba(5,5,8,0.9), 0 0 60px rgba(83,210,45,0.06)'
          : '0 24px 60px -24px rgba(5,5,8,0.85)',
        transform: isHovered ? 'scale(1.008)' : 'scale(1)',
        transition:
          'transform 280ms var(--ease-out), border-color 220ms var(--ease-soft), box-shadow 280ms var(--ease-soft)',
        outline: '1px solid rgba(255,255,255,0.06)',
        outlineOffset: '-1px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Immersive media */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${showGif && project.gif ? project.gif : project.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          filter: isHovered ? 'brightness(0.72)' : 'brightness(0.52)',
          transition:
            'transform 700ms var(--ease-out), filter 500ms var(--ease-soft)',
        }}
        role="img"
        aria-label={`${project.title} preview`}
      />

      {/* Depth scrims */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      {/* Index */}
      <div className="absolute left-6 top-6 z-20">
        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 font-mono text-xs tabular-nums text-white/65 backdrop-blur-sm">
          {String(index + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-7 md:p-10">
        <h3
          className="mb-3 max-w-4xl text-[clamp(2rem,5.5vw,5.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-white"
          style={{
            textShadow: '0 0 28px rgba(255,255,255,0.28), 0 2px 12px rgba(0,0,0,0.75)',
          }}
        >
          {project.title}
        </h3>
        <p className="mb-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
          {project.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/8 px-3.5 py-1 font-mono text-xs text-white/75 backdrop-blur-sm md:text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable group/link flex min-h-10 items-center gap-2 text-white/70 hover:text-white"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm font-medium group-hover/link:underline">View source</span>
            </a>
          )}
          {project.article && (
            <a
              href={project.article}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable group/link flex min-h-10 items-center gap-2 text-white/70 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                article
              </span>
              <span className="text-sm font-medium group-hover/link:underline">Read article</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectStackCard;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import projectsData from '../src/data/projects.json';
import { Project } from '../types';

gsap.registerPlugin(ScrollTrigger);

const projects: Project[] = projectsData as Project[];

const WorkCase: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const links = [
    project.github ? { href: project.github, label: 'View source' } : null,
    project.article ? { href: project.article, label: 'Read article' } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  const handleMouseEnter = () => {
    setIsHovered(true);
    window.dispatchEvent(
      new CustomEvent('dobby-set-expression', {
        detail: { expression: project.expression },
      })
    );
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    window.dispatchEvent(
      new CustomEvent('dobby-set-expression', {
        detail: { expression: 'neutral' },
      })
    );
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = mediaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--spot-x', `${x}%`);
    el.style.setProperty('--spot-y', `${y}%`);
  }, []);

  return (
    <article
      id={`work-${project.slug}`}
      className="work-piece scroll-mt-28"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <header className="mb-6 md:mb-8">
        <p className="mb-3 font-mono text-[11px] tabular-nums tracking-[0.14em] text-cream-muted">
          {String(index + 1).padStart(2, '0')}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h3 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.1] tracking-[-0.02em] text-cream pb-1">
            {project.title}
          </h3>
          {project.status && (
            <span className="font-serif text-base italic leading-[1.2] text-cream-muted pb-1">
              {project.status}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-[40ch] font-serif text-lg italic leading-[1.25] text-cream/85 pb-1">
          {project.subtitle}
        </p>
        <p className="mt-3 font-mono text-[11px] tracking-wide text-cream/45">
          {project.tags.join('  /  ')}
        </p>
      </header>

      <div
        ref={mediaRef}
        className="work-image group relative aspect-[16/9] w-full overflow-hidden rounded-[1rem] bg-surface-dark"
        style={{ ['--spot-x' as string]: '50%', ['--spot-y' as string]: '50%' }}
        onMouseMove={handleMouseMove}
      >
        <div
          className="work-media absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${project.image}')`,
            transform: isHovered ? 'scale(1.035)' : 'scale(1)',
            filter: isHovered ? 'brightness(1) saturate(1.04)' : 'brightness(0.9) saturate(0.96)',
          }}
          role="img"
          aria-label={`${project.title} still`}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(235,230,220,0.12), transparent 55%)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="work-copy mt-8 rounded-[1rem] px-5 py-6 md:mt-10 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          <div>
            <h4 className="mb-3 font-serif text-lg italic leading-[1.2] text-cream pb-1">
              Problem
            </h4>
            <p className="max-w-[42ch] text-[16px] font-medium leading-relaxed text-cream">
              {project.problem}
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-serif text-lg italic leading-[1.2] text-cream pb-1">
              Solution
            </h4>
            <p className="max-w-[42ch] text-[16px] font-medium leading-relaxed text-cream">
              {project.solution}
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-serif text-lg italic leading-[1.2] text-cream pb-1">
              Impact
            </h4>
            <ul className="max-w-[42ch] list-none space-y-3">
              {project.impact.map((item) => (
                <li key={item} className="text-[16px] font-medium leading-relaxed text-cream">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {links.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-cream/20 px-4 py-2 text-sm text-cream hover:bg-cream hover:text-ink"
            >
              {link.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

const ProjectsScroll: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? '');

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pieces = section.querySelectorAll<HTMLElement>('.work-piece');

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([titleRef.current, pieces], { opacity: 1, y: 0 });
        return;
      }

      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      pieces.forEach((piece) => {
        gsap.fromTo(
          piece,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: piece,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, section);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const slug = visible?.target.getAttribute('id')?.replace('work-', '');
        if (slug) setActiveSlug(slug);
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.15, 0.35, 0.6] }
    );

    pieces.forEach((piece) => observer.observe(piece));

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, []);

  const scrollToCase = (slug: string) => {
    document.getElementById(`work-${slug}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative px-6 pb-32 pt-20 md:px-12 md:pb-44 md:pt-28"
      aria-label="Projects"
    >
      <div className="mx-auto max-w-[1400px]">
        <header ref={titleRef} className="mb-14 md:mb-20">
          <h2 className="font-serif text-[clamp(4.5rem,14vw,10rem)] font-normal leading-[0.86] tracking-[-0.04em] text-cream">
            Work
          </h2>
          <p className="mt-4 font-serif text-xl italic leading-[1.2] text-cream-muted pb-1 md:text-2xl">
            Selected projects
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-16 xl:grid-cols-[240px_minmax(0,1fr)]">
          <nav
            className="mb-12 hidden lg:sticky lg:top-28 lg:mb-0 lg:block"
            aria-label="Project index"
          >
            <ol className="space-y-1">
              {projects.map((project, index) => {
                const isActive = activeSlug === project.slug;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => scrollToCase(project.slug)}
                      className={`pressable flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left ${
                        isActive ? 'text-cream' : 'text-cream-muted hover:text-cream'
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className="font-mono text-[11px] tabular-nums tracking-[0.12em] text-cream/40">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`font-serif leading-[1.2] pb-0.5 ${
                          isActive ? 'text-[1.45rem]' : 'text-[1.05rem]'
                        }`}
                      >
                        {project.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex flex-col gap-24 md:gap-32">
            {projects.map((project, index) => (
              <WorkCase key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsScroll;

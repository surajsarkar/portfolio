import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SKILL_CATEGORIES = [
  {
    name: 'Languages',
    skills: ['Python', 'Rust', 'Go'],
    angle: -90,
  },
  {
    name: 'Infrastructure',
    skills: ['AWS'],
    angle: 0,
  },
  {
    name: 'Storage',
    skills: ['Postgres', 'Redis', 'Qdrant', 'Chroma'],
    angle: 90,
  },
  {
    name: 'Intelligence',
    skills: ['PyTorch', 'Hugging Face', 'vLLM'],
    angle: 180,
  },
];

interface SignalPacket {
  id: number;
  skillIndex: number;
  categoryIndex: number;
  progress: number;
  phase: 'skill-to-category' | 'category-to-center';
}

const Skills: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const packetsLayerRef = useRef<SVGGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [centerPulse, setCenterPulse] = useState(false);
  const packetsRef = useRef<SignalPacket[]>([]);
  const packetIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const circlePoolRef = useRef<SVGCircleElement[]>([]);

  useEffect(() => {
    const updateDimensions = () => {
      if (constellationRef.current) {
        const rect = constellationRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.12 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !centerRef.current || dimensions.width === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([centerRef.current, '.category-node', '.skill-node', svgRef.current], {
          opacity: 1,
          scale: 1,
        });
        return;
      }

      // Center: scale from near-zero (never absolute 0)
      gsap.fromTo(
        centerRef.current,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Heading: scale transform only (not font-size layout thrash)
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { scale: 3.2, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      const categoryNodes = containerRef.current?.querySelectorAll('.category-node');
      if (categoryNodes?.length) {
        gsap.fromTo(
          categoryNodes,
          { scale: 0.92, opacity: 0, y: 16 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 68%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      const skillNodes = containerRef.current?.querySelectorAll('.skill-node');
      if (skillNodes?.length) {
        gsap.fromTo(
          skillNodes,
          { scale: 0.94, opacity: 0, y: 10 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 58%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (svgRef.current) {
        gsap.fromTo(
          svgRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [dimensions.width]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const categoryRadius = dimensions.width < 500 ? 130 : Math.min(180, dimensions.width * 0.28);
  const skillBaseRadius = dimensions.width < 500 ? 80 : Math.min(110, dimensions.width * 0.16);

  const getMobileAngle = useCallback((baseAngle: number) => {
    if (dimensions.width >= 500) return baseAngle;
    if (baseAngle === -90) return -60;
    if (baseAngle === 0) return 30;
    if (baseAngle === 90) return 120;
    if (baseAngle === 180) return 210;
    return baseAngle;
  }, [dimensions.width]);

  const getCategoryPosition = useCallback(
    (baseAngle: number) => {
      const angle = getMobileAngle(baseAngle);
      const rad = (angle * Math.PI) / 180;
      const xScale = dimensions.width < 500 ? 0.75 : 1;
      const yScale = dimensions.width < 500 ? 1.15 : 1;
      return {
        x: centerX + Math.cos(rad) * categoryRadius * xScale,
        y: centerY + Math.sin(rad) * categoryRadius * yScale,
      };
    },
    [centerX, centerY, categoryRadius, getMobileAngle, dimensions.width]
  );

  const getSkillPosition = useCallback(
    (baseCategoryAngle: number, skillIndex: number, totalSkills: number) => {
      const catPos = getCategoryPosition(baseCategoryAngle);
      const categoryAngle = getMobileAngle(baseCategoryAngle);
      const arcSpread = dimensions.width < 500 ? 120 : 180;
      const startAngle = categoryAngle - arcSpread / 2;
      const angleStep = totalSkills > 1 ? arcSpread / (totalSkills - 1) : 0;
      const skillAngle = totalSkills === 1 ? categoryAngle : startAngle + skillIndex * angleStep;
      const rad = (skillAngle * Math.PI) / 180;
      const xScale = dimensions.width < 500 ? 0.75 : 1;
      const yScale = dimensions.width < 500 ? 1.15 : 1;
      return {
        x: catPos.x + Math.cos(rad) * skillBaseRadius * xScale,
        y: catPos.y + Math.sin(rad) * skillBaseRadius * yScale,
      };
    },
    [getCategoryPosition, getMobileAngle, skillBaseRadius, dimensions.width]
  );

  const pulseCenter = useCallback(() => {
    setCenterPulse(true);
    window.setTimeout(() => setCenterPulse(false), 180);
  }, []);

  // Signal packets — DOM pool, no React re-render per frame
  useEffect(() => {
    if (!isVisible || dimensions.width === 0) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const createPacket = () => {
      const catIndex = Math.floor(Math.random() * SKILL_CATEGORIES.length);
      const category = SKILL_CATEGORIES[catIndex];
      const skillIndex = Math.floor(Math.random() * category.skills.length);
      packetsRef.current.push({
        id: packetIdRef.current++,
        categoryIndex: catIndex,
        skillIndex,
        progress: 0,
        phase: 'skill-to-category',
      });
    };

    const timeouts: number[] = [];
    const intervals: number[] = [];
    SKILL_CATEGORIES.forEach((_, catIndex) => {
      const delay = catIndex * 700 + Math.random() * 900;
      const t = window.setTimeout(() => {
        createPacket();
        const interval = window.setInterval(createPacket, 2600 + Math.random() * 1800);
        intervals.push(interval);
      }, delay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [isVisible, dimensions.width]);

  useEffect(() => {
    if (!isVisible || !packetsLayerRef.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const layer = packetsLayerRef.current;
    const ensureCircle = (index: number) => {
      if (!circlePoolRef.current[index]) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', '3');
        c.setAttribute('fill', '#ebe6dc');
        c.style.filter = 'drop-shadow(0 0 4px rgba(235, 230, 220, 0.45))';
        layer.appendChild(c);
        circlePoolRef.current[index] = c;
      }
      return circlePoolRef.current[index];
    };

    const animate = () => {
      const packets = packetsRef.current;
      const speed = 0.012;

      for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        packet.progress += speed;

        if (packet.phase === 'skill-to-category' && packet.progress >= 1) {
          packet.phase = 'category-to-center';
          packet.progress = 0;
        } else if (packet.phase === 'category-to-center' && packet.progress >= 1) {
          pulseCenter();
          packets.splice(i, 1);
        }
      }

      // Position circles
      packets.forEach((packet, i) => {
        const category = SKILL_CATEGORIES[packet.categoryIndex];
        const catPos = getCategoryPosition(category.angle);
        const skillPos = getSkillPosition(
          category.angle,
          packet.skillIndex,
          category.skills.length
        );

        let x: number;
        let y: number;
        // Smoothstep for softer travel
        const t = packet.progress * packet.progress * (3 - 2 * packet.progress);
        if (packet.phase === 'skill-to-category') {
          x = skillPos.x + (catPos.x - skillPos.x) * t;
          y = skillPos.y + (catPos.y - skillPos.y) * t;
        } else {
          x = catPos.x + (centerX - catPos.x) * t;
          y = catPos.y + (centerY - catPos.y) * t;
        }

        const circle = ensureCircle(i);
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.style.opacity = '1';
      });

      // Hide unused pool circles
      for (let i = packets.length; i < circlePoolRef.current.length; i++) {
        circlePoolRef.current[i].style.opacity = '0';
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible, centerX, centerY, getCategoryPosition, getSkillPosition, pulseCenter]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-16 md:py-32"
      style={{ backgroundColor: 'transparent' }}
      aria-label="Toolchain"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <div ref={constellationRef} className="relative h-[min(60vh,640px)] min-h-[380px] md:h-[min(72vh,640px)] md:min-h-[480px]">
          {/* Center hub */}
          <div
            ref={centerRef}
            className="absolute z-30 flex items-center justify-center opacity-0"
            style={{
              left: centerX,
              top: centerY,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`absolute rounded-full transition-[opacity,transform] duration-200 ease-out ${
                centerPulse ? 'scale-110 opacity-80' : 'scale-100 opacity-30'
              }`}
              style={{
                width: dimensions.width < 500 ? '110px' : '210px',
                height: dimensions.width < 500 ? '110px' : '210px',
                background: 'radial-gradient(circle, rgba(235, 230, 220, 0.16) 0%, transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            <div
              className={`relative flex h-[80px] w-[80px] md:h-[168px] md:w-[168px] items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-200 ${
                centerPulse
                  ? 'border-cream/60 shadow-[0_0_40px_rgba(235,230,220,0.16)]'
                  : 'border-cream/20 shadow-[0_0_24px_rgba(235,230,220,0.08)]'
              }`}
              style={{
                background:
                  'radial-gradient(circle, rgba(235, 230, 220, 0.08) 0%, rgba(12, 12, 11, 0.92) 70%)',
              }}
            >
              <span
                ref={headingRef}
                className="origin-center font-serif text-[13px] md:text-base italic leading-[1.2] text-cream"
              >
                Toolchain
              </span>
            </div>
          </div>

          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            aria-hidden="true"
          >
            {dimensions.width > 0 &&
              SKILL_CATEGORIES.map((category) => {
                const catPos = getCategoryPosition(category.angle);
                return (
                  <g key={category.name}>
                    <line
                      x1={catPos.x}
                      y1={catPos.y}
                      x2={centerX}
                      y2={centerY}
                      stroke="rgba(235, 230, 220, 0.16)"
                      strokeWidth={1}
                    />
                    {category.skills.map((_, skillIndex) => {
                      const skillPos = getSkillPosition(
                        category.angle,
                        skillIndex,
                        category.skills.length
                      );
                      return (
                        <line
                          key={skillIndex}
                          x1={skillPos.x}
                          y1={skillPos.y}
                          x2={catPos.x}
                          y2={catPos.y}
                          stroke="rgba(154, 148, 136, 0.28)"
                          strokeWidth={1}
                        />
                      );
                    })}
                  </g>
                );
              })}
            <g ref={packetsLayerRef} />
          </svg>

          {dimensions.width > 0 &&
            SKILL_CATEGORIES.map((category) => {
              const catPos = getCategoryPosition(category.angle);
              return (
                <div
                  key={category.name}
                  className="category-node absolute z-20 opacity-0"
                  style={{
                    left: catPos.x,
                    top: catPos.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="rounded-full border border-cream/15 bg-ink/70 px-3 py-1 md:px-4 md:py-2 backdrop-blur-md">
                    <span className="whitespace-nowrap font-serif text-[11px] md:text-sm italic leading-[1.2] text-cream">
                      {category.name}
                    </span>
                  </div>
                </div>
              );
            })}

          {dimensions.width > 0 &&
            SKILL_CATEGORIES.map((category) =>
              category.skills.map((skill, skillIndex) => {
                const skillPos = getSkillPosition(
                  category.angle,
                  skillIndex,
                  category.skills.length
                );
                return (
                  <div
                    key={skill}
                    className="skill-node absolute z-10 opacity-0"
                    style={{
                      left: skillPos.x,
                      top: skillPos.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="rounded-full border border-cream/10 bg-cream/[0.04] px-2 py-1 md:px-3 md:py-1.5 backdrop-blur-sm">
                      <span className="whitespace-nowrap text-[10px] md:text-sm font-medium text-cream/80">
                        {skill}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      </div>
    </section>
  );
};

export default Skills;

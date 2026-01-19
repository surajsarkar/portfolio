
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Skill categories with compass positions
const SKILL_CATEGORIES = [
  {
    name: 'LANGUAGES',
    skills: ['Python', 'Rust', 'Go'],
    angle: -90, // North
  },
  {
    name: 'INFRASTRUCTURE',
    skills: ['AWS'],
    angle: 0, // East
  },
  {
    name: 'STORAGE',
    skills: ['Postgres', 'Redis', 'Qdrant', 'Chroma'],
    angle: 90, // South
  },
  {
    name: 'INTELLIGENCE',
    skills: ['PyTorch', 'Hugging Face', 'vLLM'],
    angle: 180, // West
  },
];

// Star field background
const SkillsStars: React.FC<{ count: number }> = ({ count }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: HTMLDivElement[] = [];
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 2 + 0.5;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const opacity = 0.15 + Math.random() * 0.3;

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
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// Signal packet type
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
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [centerPulse, setCenterPulse] = useState(false);
  const packetsRef = useRef<SignalPacket[]>([]);
  const packetIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const [, forceUpdate] = useState({});

  // Dimensions
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

  // Intersection observer + scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // GSAP Scroll Animation
  useEffect(() => {
    if (!containerRef.current || !centerRef.current || dimensions.width === 0) return;

    const ctx = gsap.context(() => {
      // Center - scale up from 0
      gsap.fromTo(
        centerRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Heading - animate from large (like Projects) to smaller
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { fontSize: '8rem' },
          {
            fontSize: '1.5rem',
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Category nodes - fly in from outside
      const categoryNodes = containerRef.current?.querySelectorAll('.category-node');
      if (categoryNodes) {
        gsap.fromTo(
          categoryNodes,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Skill nodes - fade in with stagger
      const skillNodes = containerRef.current?.querySelectorAll('.skill-node');
      if (skillNodes) {
        gsap.fromTo(
          skillNodes,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // SVG lines - draw in
      gsap.fromTo(
        svgRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [dimensions.width]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const categoryRadius = 180;
  const skillBaseRadius = 110; // Distance from category to skill

  // Category position
  const getCategoryPosition = useCallback((angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + Math.cos(rad) * categoryRadius,
      y: centerY + Math.sin(rad) * categoryRadius,
    };
  }, [centerX, centerY]);

  // Skill position - semi-circle around category facing OUTWARD (away from center)
  const getSkillPosition = useCallback((categoryAngle: number, skillIndex: number, totalSkills: number) => {
    const catPos = getCategoryPosition(categoryAngle);

    // Distribute skills in a 180° arc facing AWAY from center
    const arcSpread = 180; // Semi-circle
    const startAngle = categoryAngle - arcSpread / 2;
    const angleStep = totalSkills > 1 ? arcSpread / (totalSkills - 1) : 0;
    const skillAngle = totalSkills === 1 ? categoryAngle : startAngle + skillIndex * angleStep;

    const rad = (skillAngle * Math.PI) / 180;
    return {
      x: catPos.x + Math.cos(rad) * skillBaseRadius,
      y: catPos.y + Math.sin(rad) * skillBaseRadius,
    };
  }, [getCategoryPosition]);

  // Pulse center
  const pulseCenter = useCallback(() => {
    setCenterPulse(true);
    setTimeout(() => setCenterPulse(false), 200);
  }, []);

  // Create random signal packets
  useEffect(() => {
    if (!isVisible || dimensions.width === 0) return;

    const createPacket = () => {
      const catIndex = Math.floor(Math.random() * SKILL_CATEGORIES.length);
      const category = SKILL_CATEGORIES[catIndex];
      const skillIndex = Math.floor(Math.random() * category.skills.length);

      packetsRef.current.push({
        id: packetIdRef.current++,
        categoryIndex: catIndex,
        skillIndex: skillIndex,
        progress: 0,
        phase: 'skill-to-category',
      });
    };

    const intervals: NodeJS.Timeout[] = [];
    SKILL_CATEGORIES.forEach((_, catIndex) => {
      const delay = catIndex * 800 + Math.random() * 1000;
      setTimeout(() => {
        createPacket();
        const interval = setInterval(createPacket, 2500 + Math.random() * 2000);
        intervals.push(interval);
      }, delay);
    });

    return () => intervals.forEach(clearInterval);
  }, [isVisible, dimensions.width]);

  // Animation loop
  useEffect(() => {
    if (!isVisible) return;

    const animate = () => {
      const packets = packetsRef.current;
      const speed = 0.015;

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

      forceUpdate({});
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible, pulseCenter]);

  // Packet position
  const getPacketPosition = (packet: SignalPacket) => {
    const category = SKILL_CATEGORIES[packet.categoryIndex];
    const catPos = getCategoryPosition(category.angle);
    const skillPos = getSkillPosition(category.angle, packet.skillIndex, category.skills.length);

    if (packet.phase === 'skill-to-category') {
      return {
        x: skillPos.x + (catPos.x - skillPos.x) * packet.progress,
        y: skillPos.y + (catPos.y - skillPos.y) * packet.progress,
      };
    } else {
      return {
        x: catPos.x + (centerX - catPos.x) * packet.progress,
        y: catPos.y + (centerY - catPos.y) * packet.progress,
      };
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: 'var(--background-dark)' }}
    >
      <SkillsStars count={150} />

      <div className="relative mx-auto max-w-5xl px-4">
        <div ref={constellationRef} className="relative h-[600px]">

          {/* Center - TOOLCHAIN */}
          <div
            ref={centerRef}
            className="absolute z-30 flex items-center justify-center"
            style={{
              left: centerX,
              top: centerY,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`absolute rounded-full transition-all duration-200 ${centerPulse ? 'opacity-80 scale-110' : 'opacity-30 scale-100'}`}
              style={{
                width: '220px',
                height: '220px',
                background: 'radial-gradient(circle, rgba(83, 210, 45, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div
              className={`relative flex items-center justify-center rounded-full border transition-all duration-200 ${centerPulse ? 'border-primary/80 shadow-[0_0_60px_rgba(83,210,45,0.6)]' : 'border-primary/30 shadow-[0_0_30px_rgba(83,210,45,0.2)]'}`}
              style={{
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(83, 210, 45, 0.2) 0%, rgba(5, 5, 8, 0.95) 70%)',
              }}
            >
              <span
                ref={headingRef}
                className="font-black text-white tracking-wider uppercase"
                style={{
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                  fontSize: '8rem', // Start large like Projects, animate to small
                }}
              >
                TOOLCHAIN
              </span>
            </div>
          </div>

          {/* Connection lines SVG */}
          <svg
            ref={svgRef}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            {dimensions.width > 0 && SKILL_CATEGORIES.map((category) => {
              const catPos = getCategoryPosition(category.angle);

              return (
                <g key={category.name}>
                  {/* Category to Center line */}
                  <line
                    x1={catPos.x}
                    y1={catPos.y}
                    x2={centerX}
                    y2={centerY}
                    stroke="rgba(83, 210, 45, 0.15)"
                    strokeWidth={1}
                  />

                  {/* Skills to Category lines */}
                  {category.skills.map((_, skillIndex) => {
                    const skillPos = getSkillPosition(category.angle, skillIndex, category.skills.length);
                    return (
                      <line
                        key={skillIndex}
                        x1={skillPos.x}
                        y1={skillPos.y}
                        x2={catPos.x}
                        y2={catPos.y}
                        stroke="rgba(100, 100, 100, 0.2)"
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Signal packets */}
            {packetsRef.current.map((packet) => {
              const pos = getPacketPosition(packet);
              return (
                <circle
                  key={packet.id}
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill="#53d22d"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(83, 210, 45, 0.8))',
                  }}
                />
              );
            })}
          </svg>

          {/* Category nodes */}
          {dimensions.width > 0 && SKILL_CATEGORIES.map((category, catIndex) => {
            const catPos = getCategoryPosition(category.angle);

            return (
              <div
                key={category.name}
                className="category-node absolute z-20"
                style={{
                  left: catPos.x,
                  top: catPos.y,
                  transform: 'translate(-50%, -50%)',
                  transitionDelay: `${catIndex * 100 + 300}ms`,
                }}
              >
                <div className="px-4 py-2 rounded-full bg-surface-dark/80 border border-primary/30 backdrop-blur-sm shadow-[0_0_15px_rgba(83,210,45,0.1)]">
                  <span className="text-xs font-semibold text-primary/90 whitespace-nowrap">{category.name}</span>
                </div>
              </div>
            );
          })}

          {/* Skill nodes */}
          {dimensions.width > 0 && SKILL_CATEGORIES.map((category, catIndex) => (
            category.skills.map((skill, skillIndex) => {
              const skillPos = getSkillPosition(category.angle, skillIndex, category.skills.length);

              return (
                <div
                  key={skill}
                  className="skill-node absolute z-10"
                  style={{
                    left: skillPos.x,
                    top: skillPos.y,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: `${catIndex * 100 + skillIndex * 60 + 500}ms`,
                  }}
                >
                  <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{skill}</span>
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;

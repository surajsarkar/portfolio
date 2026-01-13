
import React, { useState, useEffect, useRef } from 'react';
import ParticleField from './ParticleField';

const Hero: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.8 }); // Normalized coordinates (0 to 1) for background
  const [textMousePos, setTextMousePos] = useState({ x: 50, y: 50 }); // Percentage for text spotlight
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // Background glow tracking
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
        setIsHovering(true);
      }

      if (headingRef.current) {
        // Text spotlight tracking
        const hRect = headingRef.current.getBoundingClientRect();
        const hX = ((e.clientX - hRect.left) / hRect.width) * 100;
        const hY = ((e.clientY - hRect.top) / hRect.height) * 100;
        setTextMousePos({ x: hX, y: hY });
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setMousePos({ x: 0.5, y: 0.8 });
      setTextMousePos({ x: 50, y: 50 });
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      section.addEventListener('mouseleave', handleMouseLeave);
      section.addEventListener('mouseenter', () => setIsHovering(true));
    }

    return () => {
      if (section) {
        section.removeEventListener('mousemove', handleMouseMove);
        section.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Leashed background glow logic
  const anchorX = 0.5;
  const anchorY = 0.8;
  const pull = isHovering ? 0.25 : 0.05;
  const glowX = anchorX + (mousePos.x - anchorX) * pull;
  const glowY = anchorY + (mousePos.y - anchorY) * pull;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden group select-none"
    >
      {/* Starry Night Background - Milky Way Galaxy */}
      <ParticleField starCount={2000} color="#ffffff" />

      {/* Interactive Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(
              1200px circle at ${glowX * 100}% ${glowY * 100}%, 
              rgba(83, 210, 45, ${isHovering ? '0.12' : '0.06'}), 
              transparent 70%
            )
          `,
          transition: 'background 0.2s ease-out, opacity 1s ease-in-out'
        }}
      />

      {/* Static deep ambient bottom light */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-primary/10 rounded-full blur-[160px] -z-10 opacity-30"></div>

      <div className="relative z-10 mx-auto max-w-[95vw] text-center flex flex-col items-center">

        {/* Status Badge with entrance animation */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 mb-8 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-mono text-[10px] md:text-xs font-bold text-primary tracking-[0.2em] uppercase">AVAILABLE FOR FREELANCE</span>
        </div>

        {/* Massive Animated Heading */}
        <h1
          ref={headingRef}
          className={`text-[8vw] md:text-[5rem] lg:text-[6.5rem] xl:text-[8rem] font-black tracking-[-0.05em] leading-[1] mb-6 transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <span
            className="inline-block transition-all duration-300 bg-clip-text"
            style={{
              backgroundImage: `radial-gradient(circle at ${textMousePos.x}% ${textMousePos.y}%, #53d22d 0%, #ffffff 30%, #1a1a1a 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '160% 160%',
              backgroundPosition: 'center',
            }}
          >
            crafting intelligence <br className="hidden md:block" /> from backend to behaviour.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`max-w-2xl text-lg md:text-xl text-gray-400 font-medium leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          Specializing in scalable backend architechture, API development and LLM integration.
        </p>
      </div>
    </section>
  );
};

export default Hero;

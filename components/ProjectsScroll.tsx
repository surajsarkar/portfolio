import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectStackCard from './ProjectStackCard';
import ConstellationNetwork from './ConstellationNetwork';
import projectsData from '../src/data/projects.json';
import { Project } from '../types';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const projects: Project[] = projectsData as Project[];

// Calculate triangle positions for constellation
const getConstellationPositions = (containerWidth: number, containerHeight: number) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(containerWidth, containerHeight) * 0.35;

    // Triangle formation (pointing up)
    return [
        { x: centerX, y: centerY - radius * 0.8 }, // Top
        { x: centerX - radius, y: centerY + radius * 0.6 }, // Bottom left
        { x: centerX + radius, y: centerY + radius * 0.6 }, // Bottom right
    ];
};

type Phase = 'entering' | 'stacking' | 'constellation';

// Simple static stars for the projects section background
const ProjectsStars: React.FC<{ count: number }> = ({ count }) => {
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
            const opacity = 0.2 + Math.random() * 0.4;

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
                box-shadow: 0 0 ${size}px rgba(255, 255, 255, 0.5);
            `;

            container.appendChild(star);
            stars.push(star);
        }

        return () => {
            stars.forEach(star => star.remove());
        };
    }, [count]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

const ProjectsScroll: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [phase, setPhase] = useState<Phase>('entering');
    const [activeCardIndex, setActiveCardIndex] = useState(-1);
    const [stackProgress, setStackProgress] = useState(0);
    const [constellationProgress, setConstellationProgress] = useState(0);
    const [constellationPositions, setConstellationPositions] = useState<{ x: number; y: number }[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        const sticky = stickyRef.current;
        if (!container || !sticky) return;

        // Calculate constellation positions based on viewport
        const updatePositions = () => {
            const positions = getConstellationPositions(window.innerWidth, window.innerHeight);
            setConstellationPositions(positions);
        };
        updatePositions();
        window.addEventListener('resize', updatePositions);

        // Main scroll timeline
        const scrollTrigger = ScrollTrigger.create({
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: sticky,
            onUpdate: (self) => {
                const progress = self.progress;

                // Phase calculations
                // 0-0.05: Entry
                // 0.05-0.7: Card stacking
                // 0.7-1.0: Constellation explosion

                if (progress < 0.05) {
                    setPhase('entering');
                    setActiveCardIndex(-1);
                } else if (progress < 0.7) {
                    // Stacking phase
                    setPhase('stacking');

                    const stackingProgress = (progress - 0.05) / 0.65;
                    setStackProgress(stackingProgress);

                    // Determine which card is active
                    const cardIndex = Math.min(
                        Math.floor(stackingProgress * projects.length),
                        projects.length - 1
                    );
                    setActiveCardIndex(cardIndex);
                } else {
                    // Constellation phase
                    setPhase('constellation');

                    const constellationProg = (progress - 0.7) / 0.3;
                    setConstellationProgress(constellationProg);
                    setActiveCardIndex(projects.length);
                }
            }
        });

        return () => {
            scrollTrigger.kill();
            window.removeEventListener('resize', updatePositions);
        };
    }, []);

    // Animate cards based on phase and progress
    useEffect(() => {
        cardRefs.current.forEach((cardEl, index) => {
            if (!cardEl) return;

            if (phase === 'entering' || activeCardIndex < 0) {
                // Cards hidden during entry
                gsap.to(cardEl, {
                    y: '100vh',
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3
                });
            } else if (phase === 'stacking') {
                // Stacking animation
                const cardProgress = (stackProgress * projects.length) - index;

                if (cardProgress < 0) {
                    // Card hasn't entered yet - waiting below
                    gsap.to(cardEl, {
                        y: '100vh',
                        x: 0,
                        rotation: 0,
                        opacity: 0,
                        scale: 0.9,
                        zIndex: index + 10,
                        duration: 0.3
                    });
                } else if (cardProgress < 1) {
                    // Card is entering - slides up from bottom
                    const entryProgress = cardProgress;
                    gsap.to(cardEl, {
                        y: (1 - entryProgress) * window.innerHeight * 0.8,
                        x: 0,
                        rotation: 0,
                        opacity: 1,
                        scale: 1,
                        zIndex: 200, // Entering card ALWAYS on top of everything
                        duration: 0.1
                    });
                } else {
                    // Card is stacked - shuffled card effect
                    // stackPosition = how far behind the active card this card is
                    const stackPosition = activeCardIndex - index;
                    // Older cards (higher stackPosition) move DOWN and get pushed back
                    const stackOffset = stackPosition * 30; // Positive = moves down
                    const xOffset = stackPosition * (stackPosition % 2 === 0 ? 10 : -10); // Alternating horizontal shuffle
                    const rotation = stackPosition * (stackPosition % 2 === 0 ? 2 : -2); // Alternating rotation

                    gsap.to(cardEl, {
                        y: stackOffset, // Push older cards DOWN
                        x: xOffset,
                        rotation: rotation,
                        opacity: 1, // Fully opaque for all cards
                        scale: 1 - stackPosition * 0.02,
                        zIndex: 100 + index, // Higher index = newer card = on top
                        duration: 0.2
                    });
                }
            } else if (phase === 'constellation') {
                // Explosion to triangle formation
                const targetPos = constellationPositions[index];
                if (targetPos) {
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;

                    gsap.to(cardEl, {
                        x: (targetPos.x - centerX) * constellationProgress,
                        y: (targetPos.y - centerY) * constellationProgress,
                        scale: 0.35 + (1 - constellationProgress) * 0.35,
                        opacity: 1,
                        zIndex: 20,
                        duration: 0.3
                    });
                }
            }
        });
    }, [phase, activeCardIndex, stackProgress, constellationProgress, constellationPositions]);

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: `${450}vh` }} // Extended scroll area for longer sticky effect
            id="projects"
        >
            {/* Sticky container */}
            <div
                ref={stickyRef}
                className="relative w-full h-screen overflow-hidden bg-background-dark"
            >
                {/* Top ambient glow - matches hero section for continuity */}
                <div
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(83, 210, 45, 0.08) 0%, transparent 70%)',
                        filter: 'blur(80px)'
                    }}
                />

                {/* Simple stars background */}
                <ProjectsStars count={400} />

                {/* Section Title - Centered, shrinks and goes behind cards on scroll */}
                <div
                    className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none"
                    style={{
                        opacity: phase === 'entering' ? 1 : Math.max(0.15, 1 - stackProgress * 1.5),
                        transform: `scale(${phase === 'entering' ? 1 : Math.max(0.3, 1 - stackProgress * 0.7)})`,
                        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
                    }}
                >
                    <div className="text-center">
                        <h2
                            className="text-[8vw] md:text-[5rem] lg:text-[6.5rem] xl:text-[8rem] font-black text-white uppercase tracking-tighter"
                            style={{
                                textShadow: '0 0 80px rgba(255, 255, 255, 0.3), 0 4px 30px rgba(0, 0, 0, 0.9)',
                                lineHeight: '0.85',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            CORE<br />SYSTEMS
                        </h2>
                        <p
                            className="text-gray-400 text-base md:text-lg mt-6 font-mono tracking-widest uppercase"
                            style={{
                                opacity: phase === 'entering' ? 1 : Math.max(0, 1 - stackProgress * 3)
                            }}
                        >
                            // Scroll to explore
                        </p>
                    </div>
                </div>

                {/* Card stack container */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            ref={el => { cardRefs.current[index] = el; }}
                            className="absolute"
                            style={{
                                transform: 'translateY(100vh)',
                                opacity: 0
                            }}
                        >
                            <ProjectStackCard
                                project={project}
                                index={index}
                                totalCards={projects.length}
                                isActive={index === activeCardIndex}
                            />
                        </div>
                    ))}
                </div>

                {/* Constellation network lines */}
                <ConstellationNetwork
                    positions={constellationPositions}
                    isActive={phase === 'constellation' && constellationProgress > 0.3}
                    progress={Math.max(0, (constellationProgress - 0.3) / 0.7)}
                />

                {/* Scroll indicator */}
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 transition-opacity duration-500"
                    style={{ opacity: phase === 'stacking' && activeCardIndex < projects.length - 1 ? 1 : 0 }}
                >
                    <span className="text-gray-500 text-xs font-mono">SCROLL</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
                </div>
            </div>
        </section>
    );
};

export default ProjectsScroll;

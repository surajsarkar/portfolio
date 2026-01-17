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
    isActive
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showGif, setShowGif] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (project.gif) {
            setShowGif(true);
        }
        // Dispatch expression event to DobbyFace
        window.dispatchEvent(new CustomEvent('dobby-set-expression', {
            detail: { expression: project.expression }
        }));
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setShowGif(false);
        // Reset to neutral
        window.dispatchEvent(new CustomEvent('dobby-set-expression', {
            detail: { expression: 'neutral' }
        }));
    };

    return (
        <div
            className={`project-stack-card relative w-[98vw] max-w-[1400px] h-[90vh] max-h-[900px]
                        rounded-3xl overflow-hidden transition-all duration-500 ease-out bg-black
                        ${isHovered ? 'scale-[1.01]' : 'scale-100'}`}
            style={{
                border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                boxShadow: isHovered
                    ? '0 30px 100px -30px rgba(0, 0, 0, 0.8), 0 0 80px rgba(255, 255, 255, 0.05)'
                    : '0 25px 60px -20px rgba(0, 0, 0, 0.7)',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Full background image - immersive, no hard edges */}
            <div
                className="absolute inset-0 transition-all duration-700"
                style={{
                    backgroundImage: `url('${showGif && project.gif ? project.gif : project.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    filter: isHovered ? 'brightness(0.7)' : 'brightness(0.55)',
                }}
            />

            {/* Gradient overlays for immersive blending - all sides */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

            {/* Vignette effect */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
                }}
            />

            {/* Card Index Badge */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="font-mono text-xs text-white/60 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    {String(index + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
                </span>
            </div>

            {/* Content - positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-10">
                <h3
                    className="text-5xl md:text-6xl lg:text-8xl font-extrabold text-white mb-4 tracking-tight"
                    style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 2px 10px rgba(0, 0, 0, 0.8)' }}
                >
                    {project.title}
                </h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
                    {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-mono text-white/80 border border-white/10"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-6">
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group/link"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-medium group-hover/link:underline">View Source</span>
                        </a>
                    )}
                    {project.article && (
                        <a
                            href={project.article}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group/link"
                        >
                            <span className="material-symbols-outlined text-xl">article</span>
                            <span className="text-sm font-medium group-hover/link:underline">Read Article</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectStackCard;

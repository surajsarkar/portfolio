import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Position {
    x: number;
    y: number;
}

interface ConstellationNetworkProps {
    positions: Position[];
    isActive: boolean;
    progress: number; // 0 to 1
}

const ConstellationNetwork: React.FC<ConstellationNetworkProps> = ({
    positions,
    isActive,
    progress
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const linesRef = useRef<SVGPathElement[]>([]);

    useEffect(() => {
        if (!isActive || positions.length < 2) return;

        // Animate lines drawing
        linesRef.current.forEach((line) => {
            if (line) {
                const length = line.getTotalLength();
                gsap.set(line, {
                    strokeDasharray: length,
                    strokeDashoffset: length * (1 - progress),
                });
            }
        });
    }, [isActive, progress, positions]);

    if (positions.length < 2) return null;

    // Generate lines between ALL nodes (fully connected graph)
    const generateLines = () => {
        const lines: { from: Position; to: Position; index: number }[] = [];

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                lines.push({
                    from: positions[i],
                    to: positions[j],
                    index: lines.length
                });
            }
        }

        return lines;
    };

    const lines = generateLines();

    return (
        <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
                opacity: isActive ? 1 : 0,
                transition: 'opacity 480ms cubic-bezier(0.23, 1, 0.32, 1)',
                zIndex: 5
            }}
        >
            <defs>
                {/* Subtle glow filter for star-like appearance */}
                <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Very subtle pulse for nodes */}
                <filter id="nodePulse" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1.5" result="blur">
                        <animate
                            attributeName="stdDeviation"
                            values="1;2;1"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    </feGaussianBlur>
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Connection lines - white/star colored, light weight */}
            {lines.map((line, index) => (
                <g key={index}>
                    {/* Soft glow layer */}
                    <path
                        d={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#starGlow)"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 1000 * (1 - progress),
                            transition: 'stroke-dashoffset 0.5s ease-out'
                        }}
                    />
                    {/* Main line - thin and delicate */}
                    <path
                        ref={el => { if (el) linesRef.current[index] = el; }}
                        d={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="0.5"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 1000 * (1 - progress),
                            transition: 'stroke-dashoffset 0.5s ease-out'
                        }}
                    />
                </g>
            ))}

            {/* Node indicators at each position - star-like dots */}
            {positions.map((pos, index) => (
                <g key={`node-${index}`}>
                    {/* Outer glow - subtle */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="8"
                        fill="rgba(255, 255, 255, 0.1)"
                        filter="url(#nodePulse)"
                        style={{
                            opacity: progress,
                            transition: 'opacity 0.5s ease-out',
                            transitionDelay: `${index * 0.1}s`
                        }}
                    />
                    {/* Inner bright dot */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="2"
                        fill="#ffffff"
                        style={{
                            opacity: progress,
                            transition: 'opacity 0.5s ease-out',
                            transitionDelay: `${index * 0.1}s`
                        }}
                    />
                </g>
            ))}

            {/* Subtle animated particles along lines - only when fully visible */}
            {isActive && progress > 0.9 && lines.map((line, index) => (
                <circle
                    key={`particle-${index}`}
                    r="1.5"
                    fill="rgba(255, 255, 255, 0.8)"
                    filter="url(#starGlow)"
                >
                    <animateMotion
                        dur={`${4 + index * 0.8}s`}
                        repeatCount="indefinite"
                        path={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                    />
                </circle>
            ))}
        </svg>
    );
};

export default ConstellationNetwork;

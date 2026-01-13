import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParticleFieldProps {
    starCount?: number;
    color?: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
    starCount = 200,
    color = '#ffffff'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const starsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Create stars with varying sizes for depth effect (Milky Way style)
        const stars: HTMLDivElement[] = [];

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');

            // Vary star sizes for depth - more small stars, fewer large ones
            const sizeRandom = Math.random();
            let size: number;
            if (sizeRandom < 0.7) {
                size = Math.random() * 1 + 0.3; // 70% tiny stars (0.3-1.3px)
            } else if (sizeRandom < 0.9) {
                size = Math.random() * 1.5 + 1; // 20% medium stars (1-2.5px)
            } else {
                size = Math.random() * 2 + 2; // 10% bright stars (2-4px)
            }

            const x = Math.random() * width;
            // Concentrate more stars in the vertical center (behind heading)
            const centerBias = Math.random();
            let y: number;
            if (centerBias < 0.8) {
                // 80% of stars clustered in middle 35% of screen (behind heading)
                y = height * 0.32 + Math.random() * height * 0.35;
            } else {
                y = Math.random() * height;
            }

            // Opacity based on size - larger stars brighter
            const baseOpacity = size < 1 ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5;
            const twinkleDelay = Math.random() * 8;

            // Add slight color variation for realism
            const colorVariation = Math.random();
            let starColor = color;
            if (colorVariation > 0.9) {
                starColor = '#fffae6'; // Warm white/yellow
            } else if (colorVariation > 0.85) {
                starColor = '#e6f0ff'; // Cool blue-white
            }

            star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${starColor};
        border-radius: 50%;
        opacity: ${baseOpacity};
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        box-shadow: 0 0 ${size * 2}px ${starColor}${size > 2 ? '' : '80'};
        will-change: opacity;
      `;

            container.appendChild(star);
            stars.push(star);

            // Twinkle animation - slower and more subtle for distant stars
            const twinkleDuration = size < 1 ? 3 + Math.random() * 4 : 1.5 + Math.random() * 2;
            gsap.to(star, {
                opacity: baseOpacity * (0.3 + Math.random() * 0.3),
                duration: twinkleDuration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: twinkleDelay
            });
        }

        // Add a subtle "Milky Way band" gradient overlay
        const milkyWayBand = document.createElement('div');
        milkyWayBand.style.cssText = `
      position: absolute;
      top: 30%;
      left: -10%;
      width: 120%;
      height: 40%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.02) 20%,
        rgba(255, 255, 255, 0.04) 40%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0.04) 60%,
        rgba(255, 255, 255, 0.02) 80%,
        transparent 100%
      );
      transform: rotate(-15deg);
      filter: blur(30px);
      pointer-events: none;
    `;
        container.appendChild(milkyWayBand);

        starsRef.current = stars;

        // Create shooting star function (only for random automatic ones)
        const createShootingStar = () => {
            const shootingStar = document.createElement('div');
            const length = 80 + Math.random() * 100;
            const startX = Math.random() * width * 0.8;
            const startY = Math.random() * height * 0.4;
            const angle = Math.random() * 40 + 20; // 20-60 degrees

            const radians = (angle * Math.PI) / 180;
            const endX = startX + Math.cos(radians) * (400 + Math.random() * 300);
            const endY = startY + Math.sin(radians) * (400 + Math.random() * 300);

            shootingStar.style.cssText = `
        position: absolute;
        width: ${length}px;
        height: 1.5px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), #ffffff);
        border-radius: 2px;
        opacity: 0;
        pointer-events: none;
        left: ${startX}px;
        top: ${startY}px;
        transform-origin: left center;
        transform: rotate(${angle}deg);
        box-shadow: 0 0 6px #ffffff, 0 0 12px rgba(255,255,255,0.5);
        will-change: transform, opacity;
      `;

            container.appendChild(shootingStar);

            // Animate the shooting star
            const tl = gsap.timeline({
                onComplete: () => shootingStar.remove()
            });

            tl.to(shootingStar, {
                opacity: 1,
                duration: 0.1,
                ease: 'power2.out'
            })
                .to(shootingStar, {
                    x: endX - startX,
                    y: endY - startY,
                    duration: 0.5 + Math.random() * 0.4,
                    ease: 'power1.in'
                }, 0)
                .to(shootingStar, {
                    opacity: 0,
                    scaleX: 0.2,
                    duration: 0.25,
                    ease: 'power2.in'
                }, '-=0.2');
        };

        // Random shooting stars (less frequent for more realism)
        const randomShootingStarInterval = setInterval(() => {
            if (Math.random() > 0.4) { // 60% chance each interval
                createShootingStar();
            }
        }, 4000 + Math.random() * 3000);

        // Create Voyager-like satellite
        const createSatellite = () => {
            const satellite = document.createElement('div');
            const startX = width * 0.3 + Math.random() * width * 0.4; // Random horizontal start near center
            const startY = height * 0.35; // Start from heading area

            satellite.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Main body -->
                    <rect x="10" y="8" width="4" height="8" fill="#888" stroke="#aaa" stroke-width="0.5"/>
                    <!-- Solar panel left -->
                    <rect x="2" y="10" width="8" height="4" fill="#4a90d9" stroke="#6ab0ff" stroke-width="0.5"/>
                    <!-- Solar panel right -->
                    <rect x="14" y="10" width="8" height="4" fill="#4a90d9" stroke="#6ab0ff" stroke-width="0.5"/>
                    <!-- Antenna -->
                    <line x1="12" y1="8" x2="12" y2="4" stroke="#ccc" stroke-width="1"/>
                    <circle cx="12" cy="3" r="2" fill="none" stroke="#ccc" stroke-width="0.5"/>
                    <!-- Thruster glow -->
                    <ellipse cx="12" cy="17" rx="1.5" ry="1" fill="#ff6b35" opacity="0.6"/>
                </svg>
            `;

            satellite.style.cssText = `
                position: absolute;
                left: ${startX}px;
                top: ${startY}px;
                opacity: 0;
                pointer-events: none;
                filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
                transform: rotate(180deg);
                z-index: 2;
            `;

            container.appendChild(satellite);

            // Animate satellite moving slowly downward (south)
            const tl = gsap.timeline({
                onComplete: () => {
                    satellite.remove();
                    // Create next satellite after a delay
                    setTimeout(createSatellite, 20000 + Math.random() * 30000);
                }
            });

            // Fade in
            tl.to(satellite, {
                opacity: 0.8,
                duration: 3,
                ease: 'power2.out'
            })
                // Slow drift downward (90 degrees south) with slight horizontal movement
                .to(satellite, {
                    y: height * 0.8,
                    x: (Math.random() - 0.5) * 100, // Slight horizontal drift
                    duration: 60 + Math.random() * 30, // 60-90 seconds journey
                    ease: 'none'
                }, 0)
                // Subtle rotation during flight
                .to(satellite, {
                    rotation: 185 + Math.random() * 10,
                    duration: 60,
                    ease: 'sine.inOut'
                }, 0)
                // Fade out as it exits
                .to(satellite, {
                    opacity: 0,
                    duration: 5,
                    ease: 'power2.in'
                }, '-=8');
        };

        // Start first satellite after a short delay
        const satelliteTimeout = setTimeout(createSatellite, 5000);

        // Cleanup
        return () => {
            clearInterval(randomShootingStarInterval);
            clearTimeout(satelliteTimeout);
            stars.forEach(star => {
                gsap.killTweensOf(star);
                star.remove();
            });
            milkyWayBand.remove();
        };
    }, [starCount, color]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: 0, background: 'transparent' }}
        />
    );
};

export default ParticleField;

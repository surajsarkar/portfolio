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
            const y = Math.random() * height;

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

        // Cleanup
        return () => {
            clearInterval(randomShootingStarInterval);
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

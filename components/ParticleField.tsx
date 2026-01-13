import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParticleFieldProps {
    starCount?: number;
    color?: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
    starCount = 400,
    color = '#ffffff'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Create stars - most are static, only some twinkle
        const stars: HTMLDivElement[] = [];
        const twinklingStars: HTMLDivElement[] = [];

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');

            // Vary star sizes for depth - more small stars, fewer large ones
            const sizeRandom = Math.random();
            let size: number;
            if (sizeRandom < 0.75) {
                size = Math.random() * 1 + 0.3; // 75% tiny stars
            } else if (sizeRandom < 0.92) {
                size = Math.random() * 1.5 + 1; // 17% medium stars
            } else {
                size = Math.random() * 2 + 2; // 8% bright stars
            }

            const x = Math.random() * width;
            // Concentrate more stars in the vertical center (behind heading)
            const centerBias = Math.random();
            let y: number;
            if (centerBias < 0.8) {
                y = height * 0.32 + Math.random() * height * 0.35;
            } else {
                y = Math.random() * height;
            }

            // Opacity based on size
            const baseOpacity = size < 1 ? 0.25 + Math.random() * 0.25 : 0.4 + Math.random() * 0.4;

            // Add slight color variation for realism
            const colorVariation = Math.random();
            let starColor = color;
            if (colorVariation > 0.92) {
                starColor = '#fffae6';
            } else if (colorVariation > 0.87) {
                starColor = '#e6f0ff';
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
                box-shadow: 0 0 ${size}px ${starColor}60;
            `;

            container.appendChild(star);
            stars.push(star);

            // Only animate ~1% of stars (max 25) for performance - only bright ones
            if (sizeRandom > 0.92 && twinklingStars.length < 25) {
                twinklingStars.push(star);
            }
        }

        // Animate only the twinkling stars - slow but noticeable
        twinklingStars.forEach((star, index) => {
            const delay = index * 0.3; // Stagger animations
            const baseOpacity = parseFloat(star.style.opacity);
            gsap.to(star, {
                opacity: baseOpacity * 0.25, // More pronounced twinkle
                duration: 2 + Math.random() * 2, // 2-4 seconds - slow but visible
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: delay
            });
        });

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
                rgba(255, 255, 255, 0.015) 20%,
                rgba(255, 255, 255, 0.03) 40%,
                rgba(255, 255, 255, 0.04) 50%,
                rgba(255, 255, 255, 0.03) 60%,
                rgba(255, 255, 255, 0.015) 80%,
                transparent 100%
            );
            transform: rotate(-15deg);
            filter: blur(30px);
            pointer-events: none;
        `;
        container.appendChild(milkyWayBand);

        // Create shooting star function (reduced frequency)
        const createShootingStar = () => {
            const shootingStar = document.createElement('div');
            const length = 80 + Math.random() * 100;
            const startX = Math.random() * width * 0.8;
            const startY = Math.random() * height * 0.4;
            const angle = Math.random() * 40 + 20;

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
                box-shadow: 0 0 6px #ffffff;
            `;

            container.appendChild(shootingStar);

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

        // Shooting stars less frequently (every 6-10 seconds)
        const randomShootingStarInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                createShootingStar();
            }
        }, 6000 + Math.random() * 4000);

        // Create Voyager-like satellite
        const createSatellite = () => {
            const satellite = document.createElement('div');
            const startX = width * 0.3 + Math.random() * width * 0.4;
            const startY = height * 0.35;

            satellite.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="10" y="8" width="4" height="8" fill="#888" stroke="#aaa" stroke-width="0.5"/>
                    <rect x="2" y="10" width="8" height="4" fill="#4a90d9" stroke="#6ab0ff" stroke-width="0.5"/>
                    <rect x="14" y="10" width="8" height="4" fill="#4a90d9" stroke="#6ab0ff" stroke-width="0.5"/>
                    <line x1="12" y1="8" x2="12" y2="4" stroke="#ccc" stroke-width="1"/>
                    <circle cx="12" cy="3" r="2" fill="none" stroke="#ccc" stroke-width="0.5"/>
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

            const tl = gsap.timeline({
                onComplete: () => {
                    satellite.remove();
                    setTimeout(createSatellite, 30000 + Math.random() * 30000);
                }
            });

            tl.to(satellite, {
                opacity: 0.8,
                duration: 3,
                ease: 'power2.out'
            })
                .to(satellite, {
                    y: height * 0.8,
                    x: (Math.random() - 0.5) * 100,
                    duration: 60 + Math.random() * 30,
                    ease: 'none'
                }, 0)
                .to(satellite, {
                    rotation: 185 + Math.random() * 10,
                    duration: 60,
                    ease: 'sine.inOut'
                }, 0)
                .to(satellite, {
                    opacity: 0,
                    duration: 5,
                    ease: 'power2.in'
                }, '-=8');
        };

        const satelliteTimeout = setTimeout(createSatellite, 8000);

        // Cleanup
        return () => {
            clearInterval(randomShootingStarInterval);
            clearTimeout(satelliteTimeout);
            twinklingStars.forEach(star => gsap.killTweensOf(star));
            stars.forEach(star => star.remove());
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

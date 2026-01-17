import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DobbyFace.css';

type Expression = 'neutral' | 'irritated' | 'love' | 'excited' | 'scrollUp' | 'scrollDown';

const DobbyFace: React.FC = () => {
    const [expression, setExpression] = useState<Expression>('neutral');
    const [audioEnabled, setAudioEnabled] = useState(false);
    const eyesContainerRef = useRef<HTMLDivElement>(null);
    const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScrollY = useRef(0);
    const isScrolling = useRef(false);

    // Initialize audio context on first click interaction
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        setAudioEnabled(true);
    }, []);

    // Play a tone
    const playTone = useCallback((freq: number, type: OscillatorType = 'sine', duration: number = 0.1, startTime: number = 0) => {
        const ctx = audioCtxRef.current;
        if (!ctx || !audioEnabled) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, [audioEnabled]);

    // Play irritated sound (grumpy buzz)
    const playIrritatedSound = useCallback(() => {
        if (!audioEnabled) return;
        playTone(150, 'sawtooth', 0.1);
        playTone(120, 'sawtooth', 0.15, 0.1);
    }, [audioEnabled, playTone]);

    // Play love sound (happy arpeggio)
    const playLoveSound = useCallback(() => {
        if (!audioEnabled) return;
        playTone(523.25, 'sine', 0.3, 0);
        playTone(659.25, 'sine', 0.3, 0.1);
        playTone(783.99, 'sine', 0.4, 0.2);
    }, [audioEnabled, playTone]);

    // Play excited sound (power-up sequence)
    const playExcitedSound = useCallback(() => {
        if (!audioEnabled) return;
        playTone(880, 'triangle', 0.1, 0);
        playTone(1108, 'triangle', 0.1, 0.1);
        playTone(1318, 'triangle', 0.1, 0.2);
        playTone(1760, 'triangle', 0.2, 0.3);
    }, [audioEnabled, playTone]);

    // Play scroll sound (servo motor style from original)
    const playScrollSound = useCallback((direction: 'up' | 'down') => {
        const ctx = audioCtxRef.current;
        if (!ctx || !audioEnabled) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Sawtooth sounds mechanical
        osc.type = 'sawtooth';

        const now = ctx.currentTime;

        if (direction === 'up') {
            // Pitch slide UP
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        } else {
            // Pitch slide DOWN
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.4);
        }

        // Low volume for motor hum
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }, [audioEnabled]);

    // Handle hover on robot face - switch to irritated
    const handleMouseEnter = useCallback(() => {
        if (!isScrolling.current) {
            setExpression('irritated');
            playIrritatedSound();
        }
    }, [playIrritatedSound]);

    // Handle hover end - restore neutral expression
    const handleMouseLeave = useCallback(() => {
        if (!isScrolling.current) {
            setExpression('neutral');
        }
    }, []);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY.current;

            // Only trigger on noticeable scroll
            if (Math.abs(scrollDelta) > 5) {
                isScrolling.current = true;

                if (scrollDelta > 0) {
                    // Scrolling down
                    setExpression('scrollDown');
                    playScrollSound('down');
                } else {
                    // Scrolling up
                    setExpression('scrollUp');
                    playScrollSound('up');
                }

                // Clear existing timeout
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }

                // Return to neutral after scrolling stops
                scrollTimeoutRef.current = setTimeout(() => {
                    isScrolling.current = false;
                    setExpression('neutral');
                }, 300);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [playScrollSound]);

    // Listen for custom events from other components (Contact and Projects links)
    useEffect(() => {
        const handleShowLove = () => {
            setExpression('love');
            playLoveSound();
        };

        const handleHideLove = () => {
            setExpression('neutral');
        };

        const handleShowExcited = () => {
            setExpression('excited');
            playExcitedSound();
        };

        const handleHideExcited = () => {
            setExpression('neutral');
        };

        // Generic expression handler for project cards
        const handleSetExpression = (e: Event) => {
            const customEvent = e as CustomEvent<{ expression: Expression }>;
            const newExpression = customEvent.detail?.expression;
            if (newExpression && ['neutral', 'irritated', 'love', 'excited', 'scrollUp', 'scrollDown'].includes(newExpression)) {
                setExpression(newExpression);
                // Play corresponding sound
                if (newExpression === 'love') playLoveSound();
                else if (newExpression === 'excited') playExcitedSound();
            }
        };

        window.addEventListener('dobby-show-love', handleShowLove);
        window.addEventListener('dobby-hide-love', handleHideLove);
        window.addEventListener('dobby-show-excited', handleShowExcited);
        window.addEventListener('dobby-hide-excited', handleHideExcited);
        window.addEventListener('dobby-set-expression', handleSetExpression);

        return () => {
            window.removeEventListener('dobby-show-love', handleShowLove);
            window.removeEventListener('dobby-hide-love', handleHideLove);
            window.removeEventListener('dobby-show-excited', handleShowExcited);
            window.removeEventListener('dobby-hide-excited', handleHideExcited);
            window.removeEventListener('dobby-set-expression', handleSetExpression);
        };
    }, [playLoveSound, playExcitedSound]);

    // Blink effect for neutral expression
    const triggerBlink = useCallback(() => {
        if (expression !== 'neutral') return;

        const eyes = document.querySelectorAll('.dobby-face .eye');
        eyes.forEach(eye => {
            eye.classList.remove('blink');
            void (eye as HTMLElement).offsetWidth;
            eye.classList.add('blink');
        });
    }, [expression]);

    // Start blinking loop
    useEffect(() => {
        if (expression !== 'neutral') {
            if (blinkTimeoutRef.current) {
                clearTimeout(blinkTimeoutRef.current);
            }
            return;
        }

        const startBlinking = () => {
            triggerBlink();
            const randomDelay = Math.random() * 4000 + 2000;
            blinkTimeoutRef.current = setTimeout(startBlinking, randomDelay);
        };

        blinkTimeoutRef.current = setTimeout(startBlinking, 2000);

        return () => {
            if (blinkTimeoutRef.current) {
                clearTimeout(blinkTimeoutRef.current);
            }
        };
    }, [expression, triggerBlink]);

    // Enable audio on ANY click on the page
    useEffect(() => {
        const enableAudioOnClick = () => {
            initAudio();
        };

        document.addEventListener('click', enableAudioOnClick, { once: true });
        return () => document.removeEventListener('click', enableAudioOnClick);
    }, [initAudio]);

    // Mouse tracking for eyes
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!eyesContainerRef.current || isScrolling.current) return;

            const xRel = (e.clientX / window.innerWidth) - 0.5;
            const yRel = (e.clientY / window.innerHeight) - 0.5;

            const moveX = xRel * 4;
            const moveY = yRel * 4;

            eyesContainerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="dobby-face"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Don't touch me!"
        >
            <div className="robot-head floating">
                <div className="screen">
                    <div
                        className={`eyes-container expression-${expression}`}
                        ref={eyesContainerRef}
                    >
                        {/* Left Eye */}
                        <div className="eye left">
                            {/* Heart SVG */}
                            <svg className="eye-svg heart-svg" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {/* Star SVG */}
                            <svg className="eye-svg star-svg" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            {/* Irritated SVG */}
                            <svg className="eye-svg irritated-svg" viewBox="0 0 24 24">
                                <path d="M3.5,13.5L7.5,9.5L11.5,13.5L15.5,9.5L19.5,13.5" fill="none" stroke="black"
                                    strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Arrow Up SVG */}
                            <svg className="eye-svg arrow-up-svg" viewBox="0 0 24 24">
                                <path d="M12 4L6 10h4v6h4v-6h4L12 4z" />
                            </svg>
                            {/* Arrow Down SVG */}
                            <svg className="eye-svg arrow-down-svg" viewBox="0 0 24 24">
                                <path d="M12 20L18 14h-4V8h-4v6H6L12 20z" />
                            </svg>
                        </div>

                        {/* Right Eye */}
                        <div className="eye right">
                            {/* Heart SVG */}
                            <svg className="eye-svg heart-svg" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {/* Star SVG */}
                            <svg className="eye-svg star-svg" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            {/* Irritated SVG */}
                            <svg className="eye-svg irritated-svg" viewBox="0 0 24 24">
                                <path d="M3.5,13.5L7.5,9.5L11.5,13.5L15.5,9.5L19.5,13.5" fill="none" stroke="black"
                                    strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Arrow Up SVG */}
                            <svg className="eye-svg arrow-up-svg" viewBox="0 0 24 24">
                                <path d="M12 4L6 10h4v6h4v-6h4L12 4z" />
                            </svg>
                            {/* Arrow Down SVG */}
                            <svg className="eye-svg arrow-down-svg" viewBox="0 0 24 24">
                                <path d="M12 20L18 14h-4V8h-4v6H6L12 20z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DobbyFace;

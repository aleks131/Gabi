import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';

export default function VratsaReturn({ onComplete }) {
    const containerRef = useRef(null);
    const [phase, setPhase] = useState(0);
    const textRefs = useRef([]);

    // Vratsa photos slideshow in background
    const vratsaPhotos = [
        '/Photos/враца (1).jpeg',
        '/Photos/враца (1).jpg',
        '/Photos/враца (2).jpg',
        '/Photos/враца (3).jpg',
        '/Photos/враца (4).jpg',
        '/Photos/враца (5).jpg',
    ];
    const [bgIndex, setBgIndex] = useState(0);

    // Floating particles
    const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 2}px`,
        duration: `${8 + Math.random() * 12}s`,
        delay: `${Math.random() * 8}s`,
    })), []);

    useEffect(() => {
        // Slow background photo rotation
        const interval = setInterval(() => {
            setBgIndex(prev => (prev + 1) % vratsaPhotos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Phase timings — much slower
        const t1 = setTimeout(() => setPhase(1), 3000);
        const t2 = setTimeout(() => setPhase(2), 7000);
        const t3 = setTimeout(() => setPhase(3), 12000);

        // Auto-continue after 16 seconds
        const t4 = setTimeout(() => {
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 2,
                    onComplete,
                });
            }
        }, 16000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [onComplete]);

    useEffect(() => {
        textRefs.current.forEach(el => {
            if (el) {
                gsap.fromTo(el,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }
                );
            }
        });
    }, [phase]);

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0,
            background: '#050510',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Background photo (very subtle) */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${vratsaPhotos[bgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.08,
                filter: 'blur(20px)',
                transition: 'background-image 2s ease',
            }} />

            {/* Vignette overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 30%, #050510 80%)',
                pointerEvents: 'none',
            }} />

            {/* Floating particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="login-particle"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            background: '#ffffff',
                        }}
                    />
                ))}
            </div>

            {/* Text content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
            }}>
                {/* Decorative line */}
                {phase >= 1 && (
                    <div style={{
                        width: '60px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #ffffff40, transparent)',
                        marginBottom: '16px',
                    }} />
                )}

                {phase >= 1 && (
                    <div
                        ref={el => textRefs.current[0] = el}
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                            fontWeight: 200,
                            color: '#f0f0ff',
                            letterSpacing: '4px',
                            textAlign: 'center',
                            opacity: 0,
                        }}
                    >
                        Върнах се.
                    </div>
                )}

                {phase >= 2 && (
                    <div
                        ref={el => textRefs.current[1] = el}
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                            fontWeight: 300,
                            color: '#a0a0cc',
                            letterSpacing: '3px',
                            textAlign: 'center',
                            opacity: 0,
                        }}
                    >
                        Не случайно.
                    </div>
                )}

                {phase >= 3 && (
                    <div style={{
                        width: '40px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #ff339960, transparent)',
                        marginTop: '8px',
                    }} />
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';

const wishLines = [
    {
        text: 'Знам, че повечето снимки са на твоя телефон.',
        delay: 2000,
        style: 'body',
    },
    {
        text: 'Но това са нашите моменти.',
        delay: 5500,
        style: 'body',
    },
    {
        text: 'И за мен те значат повече, отколкото могат да покажат.',
        delay: 9000,
        style: 'accent',
    },
    {
        text: null, // spacer
        delay: 13000,
        style: 'spacer',
    },
    {
        text: 'Те ми напомнят, че разстоянието не спира спомените.',
        delay: 14000,
        style: 'body',
    },
    {
        text: 'Не спира усилията.',
        delay: 18000,
        style: 'body',
    },
    {
        text: 'Не спира избора да бъдем един до друг.',
        delay: 21500,
        style: 'accent',
    },
    {
        text: null, // spacer
        delay: 25500,
        style: 'spacer',
    },
    {
        text: 'Честит рожден ден, Габи.',
        delay: 27000,
        style: 'title',
    },
    {
        text: 'Пожелавам ти година, в която да откриваш нови места,',
        delay: 32000,
        style: 'body',
    },
    {
        text: 'нови мечти и нови победи.',
        delay: 35500,
        style: 'body',
    },
    {
        text: null, // spacer
        delay: 39000,
        style: 'spacer',
    },
    {
        text: 'И винаги да знаеш,',
        delay: 40000,
        style: 'body',
    },
    {
        text: 'че където и да съм,',
        delay: 43000,
        style: 'body',
    },
    {
        text: 'част от мен е до теб.',
        delay: 46000,
        style: 'final',
    },
];

export default function BirthdayWish({ onComplete }) {
    const [visibleLines, setVisibleLines] = useState([]);
    const [fadeOut, setFadeOut] = useState(false);
    const containerRef = useRef(null);
    const lineRefs = useRef([]);

    // Floating hearts/particles + flower petals
    const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.7 ? 'heart' : 'dot',
        dotSize: `${1 + Math.random() * 3}px`,
        duration: `${10 + Math.random() * 15}s`,
        delay: `${Math.random() * 12}s`,
        opacity: 0.1 + Math.random() * 0.25,
    })), []);

    // Falling flower petals
    const petals = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${12 + Math.random() * 10}s`,
        delay: `${Math.random() * 15}s`,
        size: `${12 + Math.random() * 8}px`,
        rotation: Math.random() * 360,
        swayAmount: 30 + Math.random() * 60,
    })), []);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 2.5 });
        }

        const timers = [];

        wishLines.forEach((line, i) => {
            timers.push(setTimeout(() => {
                setVisibleLines(prev => [...prev, i]);
            }, line.delay));
        });

        // Final fade out after all text
        timers.push(setTimeout(() => {
            setFadeOut(true);
        }, 52000));

        return () => timers.forEach(clearTimeout);
    }, []);

    // Animate each line when it appears
    useEffect(() => {
        if (visibleLines.length > 0) {
            const lastIndex = visibleLines[visibleLines.length - 1];
            const el = lineRefs.current[lastIndex];
            if (el) {
                gsap.fromTo(el,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 2.2, ease: 'power2.out' }
                );
            }
        }
    }, [visibleLines]);

    // Transition to forever screen when complete
    useEffect(() => {
        if (fadeOut && containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 3,
                ease: 'power2.in',
                onComplete: () => {
                    if (onComplete) onComplete();
                },
            });
        }
    }, [fadeOut, onComplete]);

    const getLineStyle = (style) => {
        switch (style) {
            case 'title':
                return {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    fontWeight: 200,
                    color: '#ffffff',
                    letterSpacing: '4px',
                    textShadow: '0 0 60px rgba(255,51,153,0.5), 0 0 30px rgba(0,229,255,0.3)',
                    marginTop: '24px',
                    marginBottom: '24px',
                };
            case 'accent':
                return {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                    fontWeight: 300,
                    color: '#e0e0ff',
                    letterSpacing: '2px',
                    textShadow: '0 0 30px rgba(0,229,255,0.3)',
                    fontStyle: 'italic',
                };
            case 'final':
                return {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.3rem, 3vw, 2rem)',
                    fontWeight: 200,
                    background: 'linear-gradient(135deg, #00e5ff, #ff3399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '3px',
                    filter: 'drop-shadow(0 0 20px rgba(255,51,153,0.4))',
                    marginTop: '16px',
                };
            case 'spacer':
                return {
                    height: '32px',
                };
            default: // body
                return {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)',
                    fontWeight: 300,
                    color: '#b0b0cc',
                    letterSpacing: '1.5px',
                    lineHeight: 1.8,
                };
        }
    };

    return (
        <div ref={containerRef} style={{
            position: 'fixed',
            inset: 0,
            background: '#050510',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            {/* Subtle background glow */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,51,153,0.06) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'breatheGlow 6s ease-in-out infinite alternate',
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'breatheGlow 8s ease-in-out infinite alternate-reverse',
                pointerEvents: 'none',
            }} />

            {/* Floating particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                {particles.map(p => (
                    p.size === 'heart' ? (
                        <div
                            key={p.id}
                            className="login-particle"
                            style={{
                                left: p.left,
                                width: '8px',
                                height: '8px',
                                animationDuration: p.duration,
                                animationDelay: p.delay,
                                opacity: p.opacity,
                                background: 'transparent',
                                color: '#ff3399',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 0,
                            }}
                        >
                            ♥
                        </div>
                    ) : (
                        <div
                            key={p.id}
                            className="login-particle"
                            style={{
                                left: p.left,
                                width: p.dotSize,
                                height: p.dotSize,
                                animationDuration: p.duration,
                                animationDelay: p.delay,
                                opacity: p.opacity,
                                background: Math.random() > 0.5 ? '#00e5ff' : '#ff3399',
                            }}
                        />
                    )
                ))}
            </div>

            {/* Falling flower petals */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
                {petals.map(p => (
                    <div
                        key={`petal-${p.id}`}
                        style={{
                            position: 'absolute',
                            left: p.left,
                            top: '-20px',
                            fontSize: p.size,
                            opacity: 0,
                            animation: `fallPetal ${p.duration} ${p.delay} linear infinite`,
                            transform: `rotate(${p.rotation}deg)`,
                            filter: 'drop-shadow(0 0 4px rgba(255,100,150,0.3))',
                        }}
                    >
                        🌸
                    </div>
                ))}
            </div>

            {/* Text content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                padding: '40px',
                maxWidth: '700px',
                textAlign: 'center',
            }}>
                {/* Top decorative line */}
                <div style={{
                    width: '80px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,51,153,0.5), transparent)',
                    marginBottom: '24px',
                    opacity: visibleLines.length > 0 ? 0.8 : 0,
                    transition: 'opacity 2s',
                }} />

                {wishLines.map((line, i) => (
                    <div
                        key={i}
                        ref={el => lineRefs.current[i] = el}
                        style={{
                            ...getLineStyle(line.style),
                            opacity: 0,
                            display: visibleLines.includes(i) ? 'block' : 'none',
                        }}
                    >
                        {line.text}
                    </div>
                ))}

                {/* Bottom decorative line */}
                {visibleLines.includes(wishLines.length - 1) && (
                    <div style={{
                        width: '80px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)',
                        marginTop: '32px',
                        animation: 'fadeIn 2s ease forwards',
                    }} />
                )}
            </div>

            <style>{`
                @keyframes breatheGlow {
                    from {
                        transform: translate(-50%, -50%) scale(0.9);
                        opacity: 0.6;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1.1);
                        opacity: 1;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 0.8; }
                }
                @keyframes fallPetal {
                    0% {
                        transform: translateY(-20px) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    5% {
                        opacity: 0.5;
                    }
                    50% {
                        transform: translateY(50vh) translateX(40px) rotate(180deg);
                        opacity: 0.4;
                    }
                    90% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translateY(105vh) translateX(-20px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}

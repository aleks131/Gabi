import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';

export default function ForeverScreen({ onReplay }) {
    const containerRef = useRef(null);
    const [showContent, setShowContent] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    // Cycle through memories
    const photos = [
        '/Photos/Море (1).jpg',
        '/Photos/трявна.jpg',
        '/Photos/враца (1).jpeg',
        '/Photos/дания (1).jpeg',
        '/Photos/Море (5).jpg',
        '/Photos/балон.jpg',
        '/Photos/враца (3).jpg',
        '/Photos/Море (10).jpg',
        '/Photos/трявна (2).jpg',
        '/Photos/враца (5).jpg',
        '/Photos/Море (15).jpg',
        '/Photos/дания (3).jpeg',
    ];

    // Floating elements
    const hearts = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${10 + Math.random() * 15}s`,
        delay: `${Math.random() * 10}s`,
        size: `${10 + Math.random() * 14}px`,
        opacity: 0.15 + Math.random() * 0.35,
        emoji: ['♥', '✦', '♡', '❋', '⋆'][Math.floor(Math.random() * 5)],
        color: ['#ff3399', '#ff6699', '#00e5ff', '#ffd700', '#ff99cc'][Math.floor(Math.random() * 5)],
    })), []);

    const petals = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${14 + Math.random() * 12}s`,
        delay: `${Math.random() * 20}s`,
        size: `${12 + Math.random() * 10}px`,
    })), []);

    const sparkles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 3}px`,
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`,
    })), []);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 3, ease: 'power2.out' }
            );
        }
        setTimeout(() => setShowContent(true), 1500);
    }, []);

    // Photo slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setPhotoIndex(prev => (prev + 1) % photos.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleReplay = useCallback(() => {
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 2,
                onComplete: onReplay,
            });
        }
    }, [onReplay]);

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
            {/* Animated gradient background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255,51,153,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,229,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.04) 0%, transparent 60%)',
                animation: 'bgShift 20s ease-in-out infinite alternate',
                pointerEvents: 'none',
            }} />

            {/* Twinkling sparkles */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                {sparkles.map(s => (
                    <div key={`sparkle-${s.id}`} style={{
                        position: 'absolute',
                        left: s.left,
                        top: s.top,
                        width: s.size,
                        height: s.size,
                        borderRadius: '50%',
                        background: '#ffffff',
                        animation: `twinkle ${s.duration} ${s.delay} ease-in-out infinite`,
                        opacity: 0,
                    }} />
                ))}
            </div>

            {/* Floating hearts and symbols */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
                {hearts.map(h => (
                    <div
                        key={`heart-${h.id}`}
                        className="login-particle"
                        style={{
                            left: h.left,
                            animationDuration: h.duration,
                            animationDelay: h.delay,
                            opacity: h.opacity,
                            fontSize: h.size,
                            color: h.color,
                            background: 'transparent',
                            width: 'auto',
                            height: 'auto',
                            borderRadius: 0,
                            textShadow: `0 0 10px ${h.color}`,
                        }}
                    >
                        {h.emoji}
                    </div>
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
                            top: '-30px',
                            fontSize: p.size,
                            opacity: 0,
                            animation: `fallPetal ${p.duration} ${p.delay} linear infinite`,
                            filter: 'drop-shadow(0 0 6px rgba(255,150,200,0.4))',
                        }}
                    >
                        {Math.random() > 0.5 ? '🌸' : '🌷'}
                    </div>
                ))}
            </div>

            {/* Main content */}
            {showContent && (
                <div style={{
                    position: 'relative',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    animation: 'riseUp 2.5s ease-out forwards',
                    opacity: 0,
                }}>
                    {/* Decorative top */}
                    <div style={{
                        width: '100px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,51,153,0.6), rgba(0,229,255,0.6), transparent)',
                    }} />

                    {/* Main title */}
                    <h1 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 200,
                        color: '#ffffff',
                        letterSpacing: '6px',
                        textAlign: 'center',
                        textShadow: '0 0 60px rgba(255,51,153,0.5), 0 0 30px rgba(0,229,255,0.3)',
                        margin: 0,
                    }}>
                        Честит рожден ден
                    </h1>

                    {/* Name with gradient */}
                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 100,
                        background: 'linear-gradient(135deg, #ff3399, #ffd700, #00e5ff, #ff3399)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '8px',
                        animation: 'gradientShift 6s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 30px rgba(255,51,153,0.5))',
                    }}>
                        Габи ♥
                    </div>

                    {/* Subtitle */}
                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
                        fontWeight: 300,
                        color: '#a0a0cc',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        marginTop: '-8px',
                    }}>
                        Версия 19.0
                    </div>

                    {/* Floating photo memory */}
                    <div style={{
                        marginTop: '20px',
                        position: 'relative',
                    }}>
                        {/* Glow behind photo */}
                        <div style={{
                            position: 'absolute',
                            inset: '-20px',
                            borderRadius: '24px',
                            background: 'radial-gradient(ellipse, rgba(255,51,153,0.15) 0%, transparent 70%)',
                            filter: 'blur(20px)',
                            animation: 'breatheGlow 4s ease-in-out infinite alternate',
                        }} />
                        <img
                            key={photoIndex}
                            src={photos[photoIndex]}
                            alt=""
                            style={{
                                width: 'clamp(200px, 40vw, 320px)',
                                height: 'clamp(150px, 30vw, 240px)',
                                objectFit: 'cover',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,51,153,0.1)',
                                animation: 'photoFade 6s ease-in-out infinite',
                            }}
                        />
                    </div>

                    {/* Final message */}
                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
                        fontWeight: 300,
                        color: '#b0b0cc',
                        letterSpacing: '2px',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginTop: '12px',
                        lineHeight: 1.8,
                    }}>
                        където и да съм, част от мен е до теб.
                    </div>

                    {/* Decorative bottom */}
                    <div style={{
                        width: '60px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)',
                    }} />

                    {/* Replay button */}
                    <button
                        onClick={handleReplay}
                        style={{
                            marginTop: '16px',
                            padding: '12px 40px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '30px',
                            color: '#a0a0cc',
                            fontFamily: 'Space Mono, monospace',
                            fontSize: '0.75rem',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.5s ease',
                            backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = 'rgba(255,51,153,0.4)';
                            e.target.style.color = '#ff3399';
                            e.target.style.boxShadow = '0 0 30px rgba(255,51,153,0.15)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                            e.target.style.color = '#a0a0cc';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        ↻ Отначало
                    </button>
                </div>
            )}

            <style>{`
                @keyframes bgShift {
                    0% { transform: scale(1) rotate(0deg); }
                    100% { transform: scale(1.1) rotate(2deg); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
                @keyframes riseUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes breatheGlow {
                    from { transform: scale(0.95); opacity: 0.6; }
                    to { transform: scale(1.05); opacity: 1; }
                }
                @keyframes photoFade {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                }
                @keyframes fallPetal {
                    0% { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
                    5% { opacity: 0.5; }
                    50% { transform: translateY(50vh) translateX(40px) rotate(180deg); opacity: 0.4; }
                    90% { opacity: 0.2; }
                    100% { transform: translateY(105vh) translateX(-20px) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

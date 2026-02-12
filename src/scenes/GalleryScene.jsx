import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';

export default function GalleryScene({ config, onContinue }) {
    const { title, subtitle, images, videos, texts, colorTone } = config;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBtn, setShowBtn] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const containerRef = useRef(null);
    const mediaRef = useRef(null);
    const btnRef = useRef(null);
    const autoPlayTimer = useRef(null);

    const allMedia = [...images, ...videos];
    const isVideo = (src) => src.match(/\.mp4$/i);

    const bgGradient = colorTone === 'warm'
        ? 'radial-gradient(ellipse at center, #1a0f0a 0%, #050510 100%)'
        : colorTone === 'cold'
            ? 'radial-gradient(ellipse at center, #0a0f1a 0%, #050510 100%)'
            : 'radial-gradient(ellipse at center, #0a0a15 0%, #050510 100%)';

    const accentColor = colorTone === 'warm' ? '#ffaa44'
        : colorTone === 'cold' ? '#4488ff'
            : '#00e5ff';

    // Auto-play slideshow
    useEffect(() => {
        if (autoPlay && allMedia.length > 1) {
            autoPlayTimer.current = setInterval(() => {
                setCurrentIndex(prev => {
                    const next = prev + 1;
                    if (next >= allMedia.length) {
                        setAutoPlay(false);
                        return prev;
                    }
                    return next;
                });
            }, 4000);
        }
        return () => clearInterval(autoPlayTimer.current);
    }, [autoPlay, allMedia.length]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 });
        }
        const t2 = setTimeout(() => setShowBtn(true), 5000);
        return () => { clearTimeout(t2); };
    }, []);

    useEffect(() => {
        if (showBtn && btnRef.current) {
            gsap.fromTo(btnRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
            );
        }
    }, [showBtn]);

    useEffect(() => {
        if (mediaRef.current) {
            gsap.fromTo(mediaRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
            );
        }
    }, [currentIndex]);

    const goNext = () => {
        setAutoPlay(false);
        if (currentIndex < allMedia.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goPrev = () => {
        setAutoPlay(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleContinue = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1.5,
            onComplete: onContinue,
        });
    };

    const particles = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 3}px`,
        animDuration: `${8 + Math.random() * 12}s`,
        animDelay: `${Math.random() * 8}s`,
    })), []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                background: bgGradient,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
            }}
        >
            {/* Color overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: colorTone === 'warm'
                    ? 'linear-gradient(180deg, rgba(255,150,50,0.04) 0%, transparent 50%, rgba(255,100,30,0.03) 100%)'
                    : colorTone === 'cold'
                        ? 'linear-gradient(180deg, rgba(50,100,255,0.04) 0%, transparent 50%, rgba(30,60,200,0.03) 100%)'
                        : 'transparent',
                pointerEvents: 'none',
                zIndex: 1,
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
                            animationDuration: p.animDuration,
                            animationDelay: p.animDelay,
                            background: accentColor,
                        }}
                    />
                ))}
            </div>

            {/* Title + subtitle */}
            <div style={{
                position: 'absolute',
                top: '4vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 5,
            }}>
                <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9rem',
                    fontWeight: 300,
                    color: accentColor,
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    textShadow: `0 0 20px ${accentColor}40`,
                }}>
                    {title}
                </div>
                {subtitle && (
                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 200,
                        color: '#a0a0cc',
                        letterSpacing: '2px',
                        fontStyle: 'italic',
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Texts — positioned above main content */}
            {texts && texts.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10vh',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 4,
                    pointerEvents: 'none',
                }}>
                    {texts.map((text, i) => (
                        <div
                            key={i}
                            style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
                                fontWeight: 200,
                                color: '#d0d0ee',
                                textAlign: 'center',
                                textShadow: `0 0 20px ${accentColor}30`,
                                letterSpacing: '2px',
                                fontStyle: 'italic',
                                animation: `fadeSlideIn 1.5s ${0.5 + i * 0.8}s ease forwards`,
                                opacity: 0,
                            }}
                        >
                            {text}
                        </div>
                    ))}
                </div>
            )}

            {/* Media display */}
            <div
                ref={mediaRef}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    maxWidth: '75vw',
                    maxHeight: '55vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {allMedia.length > 0 && (
                    isVideo(allMedia[currentIndex]) ? (
                        <video
                            key={allMedia[currentIndex]}
                            src={allMedia[currentIndex]}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                maxWidth: '100%',
                                maxHeight: '55vh',
                                borderRadius: '16px',
                                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accentColor}10`,
                            }}
                        />
                    ) : (
                        <img
                            key={allMedia[currentIndex]}
                            src={allMedia[currentIndex]}
                            alt=""
                            style={{
                                maxWidth: '100%',
                                maxHeight: '55vh',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accentColor}10`,
                            }}
                        />
                    )
                )}
            </div>

            {/* Navigation */}
            {allMedia.length > 1 && (
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '16px',
                    zIndex: 3,
                    alignItems: 'center',
                }}>
                    <button className="gallery-nav-btn" onClick={goPrev} disabled={currentIndex === 0}
                        style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}>
                        ‹
                    </button>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <span style={{
                            fontFamily: 'Space Mono, monospace',
                            fontSize: '0.8rem',
                            color: '#a0a0cc',
                        }}>
                            {currentIndex + 1} / {allMedia.length}
                        </span>
                        <div style={{
                            width: '100px',
                            height: '2px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '1px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${((currentIndex + 1) / allMedia.length) * 100}%`,
                                height: '100%',
                                background: accentColor,
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                    </div>
                    <button className="gallery-nav-btn" onClick={goNext} disabled={currentIndex === allMedia.length - 1}
                        style={{ opacity: currentIndex === allMedia.length - 1 ? 0.3 : 1 }}>
                        ›
                    </button>
                </div>
            )}

            {/* Continue button — fixed at very bottom, no overlap */}
            {showBtn && (
                <button
                    ref={btnRef}
                    className="narrative-btn"
                    style={{
                        position: 'absolute',
                        bottom: '3vh',
                        zIndex: 5,
                        opacity: 0,
                    }}
                    onClick={handleContinue}
                >
                    Продължи
                </button>
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 0.8; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

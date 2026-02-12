import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function LoginGate({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const panelRef = useRef(null);
    const gateRef = useRef(null);
    const welcomeRef = useRef(null);

    // More particles with variety
    const particles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${6 + Math.random() * 14}s`,
        animationDelay: `${Math.random() * 10}s`,
        size: `${1 + Math.random() * 3}px`,
        opacity: 0.15 + Math.random() * 0.4,
        color: Math.random() > 0.7 ? '#ff3399' : '#00e5ff',
    }));

    // Entrance animation
    useEffect(() => {
        if (panelRef.current) {
            gsap.fromTo(panelRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out', delay: 0.5 }
            );
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (username === '25/07/2025' && password === '13/02/2026') {
            setError(false);
            setSuccess(true);

            gsap.to(panelRef.current, {
                opacity: 0,
                scale: 0.9,
                y: -30,
                duration: 1.2,
                ease: 'power2.inOut',
            });

            setTimeout(() => {
                setShowWelcome(true);
            }, 1200);

        } else {
            setError(true);
            if (panelRef.current) {
                panelRef.current.classList.remove('shake');
                void panelRef.current.offsetWidth;
                panelRef.current.classList.add('shake');
            }
            setTimeout(() => setError(false), 3000);
        }
    };

    useEffect(() => {
        if (showWelcome && welcomeRef.current) {
            const tl = gsap.timeline();

            // Show decorative line first
            tl.to(welcomeRef.current.querySelector('.welcome-line-top'), {
                width: '120px',
                opacity: 0.6,
                duration: 1,
                ease: 'power2.out',
            })
                // Show welcome text
                .to(welcomeRef.current.querySelector('.welcome-text'), {
                    opacity: 1,
                    y: 0,
                    duration: 2.5,
                    ease: 'power2.out',
                }, '-=0.5')
                // Hold for longer
                .to({}, { duration: 3 })
                // Fade out
                .to(welcomeRef.current.querySelector('.welcome-text'), {
                    opacity: 0,
                    y: -10,
                    duration: 1.5,
                    ease: 'power2.in',
                })
                .to(welcomeRef.current.querySelector('.welcome-line-top'), {
                    opacity: 0,
                    duration: 0.5,
                }, '-=1')
                .to(gateRef.current, {
                    opacity: 0,
                    duration: 1.5,
                    ease: 'power2.in',
                    onComplete: () => {
                        onSuccess();
                    },
                });
        }
    }, [showWelcome, onSuccess]);

    return (
        <>
            <div className={`login-gate ${success ? 'fade-out' : ''}`} ref={gateRef}>
                {/* Particles */}
                <div className="login-particles">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="login-particle"
                            style={{
                                left: p.left,
                                width: p.size,
                                height: p.size,
                                animationDuration: p.animationDuration,
                                animationDelay: p.animationDelay,
                                opacity: p.opacity,
                                background: p.color,
                            }}
                        />
                    ))}
                </div>

                {/* Login Panel */}
                {!showWelcome && (
                    <form className="login-panel" ref={panelRef} onSubmit={handleSubmit} style={{ opacity: 0 }}>
                        {/* Decorative line */}
                        <div style={{
                            width: '60px',
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                            margin: '0 auto 28px',
                            opacity: 0.5,
                        }} />

                        <div className="login-title">Достъп до частната версия</div>

                        <div className="login-input-group">
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Потребител"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="new-password"
                                name="bday-user-x"
                                spellCheck="false"
                                autoCorrect="off"
                                autoCapitalize="off"
                                data-form-type="other"
                            />
                        </div>

                        <div className="login-input-group">
                            <input
                                type="password"
                                className="login-input"
                                placeholder="Парола"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                name="bday-pass-x"
                                data-form-type="other"
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            ВХОД
                        </button>

                        <div className={`login-error ${error ? 'visible' : ''}`}>
                            Невалиден достъп.
                        </div>

                        {/* Decorative bottom line */}
                        <div style={{
                            width: '40px',
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, #ff3399, transparent)',
                            margin: '20px auto 0',
                            opacity: 0.3,
                        }} />
                    </form>
                )}
            </div>

            {/* Welcome Overlay */}
            {showWelcome && (
                <div className="welcome-overlay" ref={welcomeRef}>
                    <div className="welcome-line-top" style={{
                        width: '0px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        marginBottom: '24px',
                        opacity: 0,
                    }} />
                    <div className="welcome-text" style={{
                        opacity: 0,
                        transform: 'translateY(15px)',
                    }}>
                        Добре дошла, Габи.
                    </div>
                </div>
            )}
        </>
    );
}

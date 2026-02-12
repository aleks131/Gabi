import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

// Heart shape parametric function
function heartPosition(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x * 0.15, y: y * 0.15 };
}

function Particles({ phase }) {
    const meshRef = useRef();
    const particleCount = 4000;
    const timeRef = useRef(0);
    const phaseStartRef = useRef(0);
    const lastPhaseRef = useRef(phase);

    const { positions, targetPositions, colors, sizes, velocities } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const tgt = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);
        const sz = new Float32Array(particleCount);
        const vel = [];

        // Create 8 firework burst centers
        const centers = Array.from({ length: 8 }, () => ({
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 6 + 3,
            z: (Math.random() - 0.5) * 4,
        }));

        for (let i = 0; i < particleCount; i++) {
            // Assign each particle to a firework center
            const center = centers[i % centers.length];
            pos[i * 3] = center.x;
            pos[i * 3 + 1] = center.y;
            pos[i * 3 + 2] = center.z;

            // Heart target positions
            const t = (i / particleCount) * Math.PI * 2;
            const heart = heartPosition(t);
            tgt[i * 3] = heart.x;
            tgt[i * 3 + 1] = heart.y + 1;
            tgt[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

            // Vibrant colors: cyan, magenta, gold, white
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                col[i * 3] = 0; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 1; // cyan
            } else if (colorChoice < 0.55) {
                col[i * 3] = 1; col[i * 3 + 1] = 0.15; col[i * 3 + 2] = 0.6; // magenta
            } else if (colorChoice < 0.75) {
                col[i * 3] = 1; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 0; // gold
            } else {
                col[i * 3] = 1; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.95; // white-pink
            }

            sz[i] = 2 + Math.random() * 5;

            // Spherical explosion velocity
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const speed = 0.15 + Math.random() * 0.25;
            vel.push(new THREE.Vector3(
                Math.sin(theta) * Math.cos(phi) * speed,
                Math.sin(theta) * Math.sin(phi) * speed,
                Math.cos(theta) * speed * 0.5,
            ));
        }

        return { positions: pos, targetPositions: tgt, colors: col, sizes: sz, velocities: vel };
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        timeRef.current += delta;

        if (phase !== lastPhaseRef.current) {
            phaseStartRef.current = timeRef.current;
            lastPhaseRef.current = phase;
        }

        const posAttr = meshRef.current.geometry.attributes.position;
        const arr = posAttr.array;

        if (phase === 'fireworks') {
            for (let i = 0; i < particleCount; i++) {
                arr[i * 3] += velocities[i].x * delta * 4;
                arr[i * 3 + 1] += velocities[i].y * delta * 4;
                arr[i * 3 + 2] += velocities[i].z * delta * 4;
                velocities[i].y -= delta * 0.08;
                // Slowly fade velocity for trail effect
                velocities[i].multiplyScalar(0.997);
            }
        } else if (phase === 'heart') {
            const phaseTime = timeRef.current - phaseStartRef.current;
            const attraction = Math.min(phaseTime * 0.5, 2.5);
            for (let i = 0; i < particleCount; i++) {
                const tx = targetPositions[i * 3];
                const ty = targetPositions[i * 3 + 1];
                const tz = targetPositions[i * 3 + 2];

                arr[i * 3] += (tx - arr[i * 3]) * delta * attraction;
                arr[i * 3 + 1] += (ty - arr[i * 3 + 1]) * delta * attraction;
                arr[i * 3 + 2] += (tz - arr[i * 3 + 2]) * delta * attraction;
            }
        } else if (phase === 'dissolve') {
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 20 + timeRef.current;
                arr[i * 3] += Math.sin(angle) * 0.03;
                arr[i * 3 + 1] += Math.cos(angle * 0.7) * 0.03;
                arr[i * 3 + 2] -= delta * 0.8;
            }
        }

        posAttr.needsUpdate = true;
    });

    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.15, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                vertexColors
                size={0.1}
                transparent
                opacity={phase === 'dissolve' ? 0.3 : 0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                map={texture}
                sizeAttenuation
            />
        </points>
    );
}

// Background stars with twinkling
function Stars() {
    const count = 3000;
    const ref = useRef();
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 2] = -20 - Math.random() * 100;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                color="#ffffff"
                size={0.06}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
}

export default function FireworksScene({ onComplete }) {
    const [phase, setPhase] = useState('fireworks');
    const [showText, setShowText] = useState(false);
    const [textStep, setTextStep] = useState(0);
    const textRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // Phase 1: Fireworks for 4 seconds (was 3)
        const t1 = setTimeout(() => setPhase('heart'), 4000);

        // Phase 2: Show text after heart forms (slower)
        const t2 = setTimeout(() => setShowText(true), 7000);

        // Text step 2: birthday message
        const t2b = setTimeout(() => setTextStep(1), 8500);

        // Phase 3: Dissolve after showing text (longer display)
        const t3 = setTimeout(() => {
            setPhase('dissolve');
        }, 14000);

        // Fade out text
        const t3b = setTimeout(() => {
            if (textRef.current) {
                gsap.to(textRef.current, { opacity: 0, duration: 2 });
            }
        }, 14500);

        // Transition to next scene (much slower)
        const t4 = setTimeout(() => {
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 2,
                    onComplete: () => onComplete(),
                });
            }
        }, 17000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t2b);
            clearTimeout(t3);
            clearTimeout(t3b);
            clearTimeout(t4);
        };
    }, [onComplete]);

    useEffect(() => {
        if (showText && textRef.current) {
            gsap.fromTo(textRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 2, ease: 'power2.out' }
            );
        }
    }, [showText]);

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0 }}>
            <Canvas camera={{ position: [0, 1, 14], fov: 55 }}>
                <color attach="background" args={['#030308']} />
                <Stars />
                <Particles phase={phase} />
                <EffectComposer>
                    <Bloom
                        intensity={2}
                        luminanceThreshold={0.08}
                        luminanceSmoothing={0.95}
                        radius={0.9}
                    />
                    <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette eskil={false} offset={0.15} darkness={0.85} />
                </EffectComposer>
            </Canvas>

            {/* Spectacular birthday text overlay */}
            {showText && (
                <div
                    ref={textRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        pointerEvents: 'none',
                        opacity: 0,
                    }}
                >
                    {/* Decorative top line */}
                    <div style={{
                        width: '120px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        marginBottom: '24px',
                        opacity: 0.6,
                    }} />

                    {/* Small subtitle */}
                    <div style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '0.85rem',
                        color: '#a0a0cc',
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                        textShadow: '0 0 20px rgba(0,229,255,0.3)',
                    }}>
                        13 • 02 • 2026
                    </div>

                    {/* Main title */}
                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        fontWeight: 200,
                        color: '#ffffff',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        letterSpacing: '3px',
                        textShadow: '0 0 60px rgba(0,229,255,0.5), 0 0 120px rgba(255,51,153,0.3)',
                    }}>
                        Честит 19-ти
                    </div>

                    <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        fontWeight: 300,
                        background: 'linear-gradient(135deg, #00e5ff, #ff3399, #ffd700)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        letterSpacing: '4px',
                        filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.4))',
                        marginTop: '8px',
                    }}>
                        Рожден Ден
                    </div>

                    {/* Name with special styling */}
                    {textStep >= 1 && (
                        <div style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(3rem, 7vw, 6rem)',
                            fontWeight: 100,
                            color: '#ffffff',
                            letterSpacing: '12px',
                            marginTop: '16px',
                            textShadow: '0 0 80px rgba(255,51,153,0.6), 0 0 40px rgba(0,229,255,0.4)',
                            animation: 'nameGlow 3s ease-in-out infinite alternate',
                        }}>
                            Габи
                        </div>
                    )}

                    {/* Decorative bottom line */}
                    <div style={{
                        width: '120px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #ff3399, transparent)',
                        marginTop: '24px',
                        opacity: 0.6,
                    }} />
                </div>
            )}

            <style>{`
                @keyframes nameGlow {
                    from {
                        text-shadow: 0 0 80px rgba(255,51,153,0.6), 0 0 40px rgba(0,229,255,0.4);
                        letter-spacing: 12px;
                    }
                    to {
                        text-shadow: 0 0 100px rgba(0,229,255,0.7), 0 0 60px rgba(255,51,153,0.5);
                        letter-spacing: 14px;
                    }
                }
            `}</style>
        </div>
    );
}

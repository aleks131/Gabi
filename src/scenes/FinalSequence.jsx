import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

// Location nodes on the "journey map"
const locations = [
    { name: 'Враца', lat: 43.21, lon: 23.55, color: '#00e5ff' },
    { name: 'Белоградчик', lat: 43.63, lon: 22.68, color: '#ff3399' },
    { name: 'Трявна', lat: 42.87, lon: 25.50, color: '#ffd700' },
    { name: 'Крит', lat: 35.24, lon: 24.47, color: '#ff6644' },
    { name: 'Дания', lat: 56.15, lon: 10.21, color: '#4488ff' },
];

function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function JourneyNodes() {
    const groupRef = useRef();
    const lineRef = useRef();
    const progressRef = useRef(0);

    const nodes = useMemo(() => {
        return locations.map(loc => ({
            ...loc,
            pos: latLongToVector3(loc.lat, loc.lon, 2.05),
        }));
    }, []);

    const lineGeo = useMemo(() => {
        const points = nodes.map(n => n.pos);
        points.push(points[0]);
        const curve = new THREE.CatmullRomCurve3(points, true);
        const curvePoints = curve.getPoints(200);
        const positions = new Float32Array(curvePoints.length * 3);
        curvePoints.forEach((p, i) => {
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return { geo, totalPoints: curvePoints.length };
    }, [nodes]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05;
        }
        if (lineRef.current) {
            progressRef.current = Math.min(progressRef.current + delta * 0.12, 1);
            lineRef.current.geometry.setDrawRange(0, Math.floor(progressRef.current * lineGeo.totalPoints));
            const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
            lineRef.current.material.opacity = pulse;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    color="#0f1a2e"
                    emissive="#0a1628"
                    emissiveIntensity={0.3}
                    roughness={0.9}
                    metalness={0.1}
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[2.15, 64, 64]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.03}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {nodes.map((node, i) => (
                <group key={i} position={node.pos.toArray()}>
                    <mesh>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial color={node.color} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.14, 16, 16]} />
                        <meshBasicMaterial
                            color={node.color}
                            transparent
                            opacity={0.3}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                </group>
            ))}
            <line ref={lineRef} geometry={lineGeo.geo}>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </line>
        </group>
    );
}

function BackgroundStars() {
    const count = 2000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 25 + Math.random() * 75;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return pos;
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.5} sizeAttenuation />
        </points>
    );
}

export default function FinalSequence({ onComplete }) {
    const [phase, setPhase] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const containerRef = useRef(null);
    const textRefs = useRef([]);
    const videoRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 2 });

        const timers = [];
        timers.push(setTimeout(() => setPhase(1), 4000));
        timers.push(setTimeout(() => setPhase(2), 8000));
        timers.push(setTimeout(() => setPhase(3), 12000));

        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        textRefs.current.forEach(el => {
            if (el) {
                gsap.fromTo(el,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 1.8, ease: 'power2.out' }
                );
            }
        });
    }, [phase]);

    const handleInstall = () => {
        setShowVideo(true);
    };

    const handleVideoEnd = () => {
        // After video, transition to birthday wish
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 2,
            onComplete: () => {
                if (onComplete) onComplete();
            },
        });
    };

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0, opacity: 0 }}>
            {!showVideo && (
                <>
                    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                        <color attach="background" args={['#050510']} />
                        <ambientLight intensity={0.3} />
                        <directionalLight position={[5, 3, 5]} intensity={0.5} />
                        <JourneyNodes />
                        <BackgroundStars />
                        <EffectComposer>
                            <Bloom intensity={1.2} luminanceThreshold={0.15} radius={0.7} />
                            <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
                            <Vignette eskil={false} offset={0.2} darkness={0.7} />
                        </EffectComposer>
                    </Canvas>

                    <div className="narrative-overlay">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            {phase >= 1 && (
                                <div
                                    ref={el => textRefs.current[0] = el}
                                    style={{
                                        fontFamily: 'Space Mono, monospace',
                                        fontSize: '1.1rem',
                                        color: '#a0a0cc',
                                        letterSpacing: '2px',
                                        opacity: 0,
                                        textAlign: 'center',
                                    }}
                                >
                                    25.07.2025 → 13.02.2026<br />
                                    <span style={{ color: '#00e5ff', fontSize: '1.3rem' }}>203 дни.</span>
                                </div>
                            )}

                            {phase >= 2 && (
                                <div
                                    ref={el => textRefs.current[1] = el}
                                    style={{
                                        fontFamily: 'Outfit, sans-serif',
                                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                                        fontWeight: 300,
                                        color: '#f0f0ff',
                                        letterSpacing: '4px',
                                        opacity: 0,
                                        marginTop: '24px',
                                        textAlign: 'center',
                                        textShadow: '0 0 40px rgba(0,229,255,0.3)',
                                    }}
                                >
                                    Версия 19.0<br />
                                    <span style={{ fontSize: '0.7em', color: '#a0a0cc' }}>Готова.</span>
                                </div>
                            )}

                            {phase >= 3 && (
                                <button
                                    ref={el => textRefs.current[2] = el}
                                    className="narrative-btn"
                                    style={{
                                        opacity: 0,
                                        marginTop: '32px',
                                        background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(255,51,153,0.15))',
                                        borderColor: 'rgba(0,229,255,0.5)',
                                        fontSize: '1.1rem',
                                        padding: '18px 56px',
                                    }}
                                    onClick={handleInstall}
                                >
                                    Инсталирай
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {showVideo && (
                <div className="final-video-container">
                    <video
                        ref={videoRef}
                        src="/Photos/Море (1).mp4"
                        autoPlay
                        playsInline
                        onEnded={handleVideoEnd}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            borderRadius: '16px',
                            boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

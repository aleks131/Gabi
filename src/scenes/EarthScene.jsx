import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

function Earth({ rotationSpeed = 0.03 }) {
    const meshRef = useRef();

    const earthTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1200);
        gradient.addColorStop(0, '#0d2847');
        gradient.addColorStop(0.5, '#0a1e3a');
        gradient.addColorStop(1, '#06132a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 1024);

        ctx.fillStyle = '#143828';
        ctx.globalAlpha = 0.7;

        // Europe
        ctx.beginPath();
        ctx.ellipse(1040, 280, 120, 80, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(1020, 200, 30, 80, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Africa
        ctx.beginPath();
        ctx.ellipse(1020, 500, 100, 180, 0, 0, Math.PI * 2);
        ctx.fill();
        // Asia
        ctx.beginPath();
        ctx.ellipse(1320, 320, 240, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        // Americas
        ctx.beginPath();
        ctx.ellipse(520, 360, 100, 200, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(600, 620, 80, 160, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Australia
        ctx.beginPath();
        ctx.ellipse(1560, 620, 80, 50, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // City lights
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffdd88';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            ctx.beginPath();
            ctx.arc(x, y, 0.5 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Grid lines
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 2048; i += 128) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
        }
        for (let i = 0; i < 1024; i += 128) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(2048, i); ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * rotationSpeed;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial
                map={earthTexture}
                emissive="#0a2040"
                emissiveIntensity={0.5}
                roughness={0.7}
                metalness={0.3}
            />
        </mesh>
    );
}

// Pulsing city marker with label
function CityMarker({ position, color = '#00e5ff', label }) {
    const groupRef = useRef();
    const beamRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
            groupRef.current.scale.setScalar(pulse);
        }
        if (beamRef.current) {
            beamRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
        }
    });

    const dir = new THREE.Vector3(...position).normalize();
    const beamEnd = dir.clone().multiplyScalar(4);

    return (
        <group>
            <group ref={groupRef} position={position}>
                {/* Solid core */}
                <mesh>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial color={color} />
                </mesh>
                {/* Inner glow */}
                <mesh>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
                </mesh>
                {/* Outer glow */}
                <mesh>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
                </mesh>
                {/* Pulsing ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.15, 0.28, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>

            {/* Light beam */}
            <line ref={beamRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([...position, beamEnd.x, beamEnd.y, beamEnd.z])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
            </line>
        </group>
    );
}

// Very visible glowing connection arc
function GlowArc({ start, end, radius = 2.05 }) {
    const tubeRef = useRef();
    const glowRef = useRef();
    const particlesRef = useRef();
    const heartRef = useRef();

    const { curve } = useMemo(() => {
        const points = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = new THREE.Vector3().lerpVectors(start, end, t);
            // Higher arc for better visibility
            point.normalize().multiplyScalar(radius + Math.sin(t * Math.PI) * 1.0);
            points.push(point);
        }
        const crv = new THREE.CatmullRomCurve3(points);
        return { curve: crv };
    }, [start, end, radius]);

    // More particles for a denser trail
    const particleGeo = useMemo(() => {
        const count = 80;
        const positions = new Float32Array(count * 3);
        const curvePoints = curve.getPoints(count - 1);
        curvePoints.forEach((p, i) => {
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [curve]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (tubeRef.current) {
            tubeRef.current.material.opacity = 0.7 + Math.sin(time * 2) * 0.25;
        }
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.3 + Math.sin(time * 2.5) * 0.15;
        }
        // Traveling particles
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array;
            const count = positions.length / 3;
            for (let i = 0; i < count; i++) {
                const t = ((i / count) + time * 0.12) % 1;
                const point = curve.getPoint(t);
                positions[i * 3] = point.x + (Math.sin(time * 5 + i) * 0.03);
                positions[i * 3 + 1] = point.y + (Math.cos(time * 4 + i) * 0.03);
                positions[i * 3 + 2] = point.z + (Math.sin(time * 3 + i * 2) * 0.03);
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
        // Pulsing heart at midpoint
        if (heartRef.current) {
            const midPoint = curve.getPoint(0.5);
            heartRef.current.position.copy(midPoint);
            const heartPulse = 1 + Math.sin(time * 3) * 0.3;
            heartRef.current.scale.setScalar(heartPulse);
        }
    });

    return (
        <group>
            {/* Main thick tube */}
            <mesh ref={tubeRef}>
                <tubeGeometry args={[curve, 80, 0.035, 12, false]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Medium glow */}
            <mesh ref={glowRef}>
                <tubeGeometry args={[curve, 80, 0.08, 12, false]} />
                <meshBasicMaterial color="#00bbff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Wide aura */}
            <mesh>
                <tubeGeometry args={[curve, 80, 0.18, 12, false]} />
                <meshBasicMaterial color="#0066cc" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Traveling sparkles */}
            <points ref={particlesRef} geometry={particleGeo}>
                <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.9} blending={THREE.AdditiveBlending} sizeAttenuation />
            </points>
            {/* Pulsing midpoint glow (like a heartbeat) */}
            <mesh ref={heartRef}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ff3399" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
}

function AtmosphereGlow() {
    return (
        <>
            <mesh>
                <sphereGeometry args={[2.08, 64, 64]} />
                <meshBasicMaterial color="#00aaff" transparent opacity={0.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh>
                <sphereGeometry args={[2.2, 64, 64]} />
                <meshBasicMaterial color="#0066aa" transparent opacity={0.03} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
        </>
    );
}

// Dense starfield + twinkling
function BackgroundStars() {
    const count = 4000;
    const pointsRef = useRef();

    const { positions, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = 15 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
            sz[i] = 0.03 + Math.random() * 0.08;
        }
        return { positions: pos, sizes: sz };
    }, []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.06} transparent opacity={0.65} sizeAttenuation />
        </points>
    );
}

// Shooting stars that streak across the sky
function ShootingStars() {
    const starsRef = useRef();
    const count = 8;

    const starData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            startPos: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                10 + Math.random() * 20,
                -15 + Math.random() * 30
            ),
            direction: new THREE.Vector3(
                -0.5 + Math.random() * -0.5,
                -0.3 + Math.random() * -0.4,
                (Math.random() - 0.5) * 0.3
            ).normalize(),
            speed: 3 + Math.random() * 5,
            phase: Math.random() * 100,
            interval: 8 + Math.random() * 15,
        }));
    }, []);

    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (starsRef.current) {
            const posArray = starsRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const star = starData[i];
                const t = ((time + star.phase) % star.interval) / star.interval;
                // Only visible for short bursts
                const visible = t < 0.15;
                if (visible) {
                    const progress = t / 0.15;
                    const pos = star.startPos.clone().add(
                        star.direction.clone().multiplyScalar(progress * star.speed * 8)
                    );
                    posArray[i * 3] = pos.x;
                    posArray[i * 3 + 1] = pos.y;
                    posArray[i * 3 + 2] = pos.z;
                } else {
                    posArray[i * 3] = 0;
                    posArray[i * 3 + 1] = 999; // hide off-screen
                    posArray[i * 3 + 2] = 0;
                }
            }
            starsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.15} transparent opacity={0.95} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
    );
}

function EarthSceneContent() {
    const groupRef = useRef();

    const vratsaPos = useMemo(() => latLongToVector3(43.21, 23.55, 2.05), []);
    const aarhusPos = useMemo(() => latLongToVector3(56.15, 10.21, 2.05), []);

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = -0.35;
            groupRef.current.rotation.x = 0.15;
        }
    }, []);

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 3, 5]} intensity={1} />
            <pointLight position={vratsaPos.toArray()} color="#00e5ff" intensity={3} distance={4} />
            <pointLight position={aarhusPos.toArray()} color="#ff3399" intensity={3} distance={4} />
            <Earth rotationSpeed={0.02} />
            <AtmosphereGlow />
            <CityMarker position={vratsaPos.toArray()} color="#00e5ff" label="Враца" />
            <CityMarker position={aarhusPos.toArray()} color="#ff3399" label="Орхус" />
            <GlowArc start={vratsaPos} end={aarhusPos} />
            <BackgroundStars />
            <ShootingStars />
        </group>
    );
}

export default function EarthScene({ onContinue }) {
    const [textPhase, setTextPhase] = useState(0);
    const containerRef = useRef(null);
    const textRefs = useRef([]);

    useEffect(() => {
        const timers = [];
        timers.push(setTimeout(() => setTextPhase(1), 3500));
        timers.push(setTimeout(() => setTextPhase(2), 7500));
        timers.push(setTimeout(() => setTextPhase(3), 12000));
        timers.push(setTimeout(() => setTextPhase(4), 16000));
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        textRefs.current.forEach(el => {
            if (el) {
                gsap.fromTo(el,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 1.8, ease: 'power2.out' }
                );
            }
        });
    }, [textPhase]);

    const handleContinue = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1.5,
            onComplete: onContinue,
        });
    };

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0 }}>
            <Canvas camera={{ position: [0, 1.2, 4.5], fov: 40 }}>
                <color attach="background" args={['#020210']} />
                <EarthSceneContent />
                <EffectComposer>
                    <Bloom intensity={2.0} luminanceThreshold={0.1} luminanceSmoothing={0.9} radius={0.9} />
                    <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette eskil={false} offset={0.15} darkness={0.75} />
                </EffectComposer>
            </Canvas>

            {/* City labels */}
            <div style={{
                position: 'absolute',
                top: '3vh',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: '60px',
                zIndex: 10,
                pointerEvents: 'none',
            }}>
                <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    color: '#00e5ff',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(0,229,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#00e5ff',
                        boxShadow: '0 0 12px #00e5ff',
                        display: 'inline-block',
                    }} />
                    Враца
                </div>
                <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.75rem',
                    color: '#555577',
                    letterSpacing: '2px',
                    alignSelf: 'center',
                }}>
                    2087 км
                </div>
                <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    color: '#ff3399',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(255,51,153,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    Орхус
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ff3399',
                        boxShadow: '0 0 12px #ff3399',
                        display: 'inline-block',
                    }} />
                </div>
            </div>

            {/* Text overlays — bottom of screen, won't overlap button */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                paddingBottom: '4vh',
                zIndex: 10,
                pointerEvents: 'none',
            }}>
                {textPhase >= 1 && (
                    <div
                        ref={el => textRefs.current[0] = el}
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
                            fontWeight: 200,
                            color: '#e0e0ff',
                            letterSpacing: '3px',
                            opacity: 0,
                            textAlign: 'center',
                            textShadow: '0 0 30px rgba(0,229,255,0.3)',
                        }}
                    >
                        Разстоянието не е пречка.
                    </div>
                )}
                {textPhase >= 2 && (
                    <div
                        ref={el => textRefs.current[1] = el}
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                            fontWeight: 300,
                            color: '#a0a0cc',
                            letterSpacing: '2px',
                            opacity: 0,
                            textAlign: 'center',
                            fontStyle: 'italic',
                        }}
                    >
                        Това е изборът. Всеки ден.
                    </div>
                )}
                {textPhase >= 3 && (
                    <div
                        ref={el => textRefs.current[2] = el}
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                            fontWeight: 300,
                            color: '#ff6699',
                            letterSpacing: '2px',
                            opacity: 0,
                            textAlign: 'center',
                            marginTop: '4px',
                            textShadow: '0 0 15px rgba(255,51,153,0.3)',
                        }}
                    >
                        Статус: <span style={{ color: '#00e5ff' }}>Свързани.</span>
                    </div>
                )}
                {textPhase >= 4 && (
                    <button
                        ref={el => textRefs.current[3] = el}
                        className="narrative-btn"
                        style={{ opacity: 0, marginTop: '12px', pointerEvents: 'all' }}
                        onClick={handleContinue}
                    >
                        Продължи
                    </button>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

// All photos for the memory sphere — every single photo
const allPhotos = [
    '/Photos/балон.jpg',
    '/Photos/трявна.jpg',
    '/Photos/трявна (2).jpg',
    '/Photos/трявна (3).jpg',
    '/Photos/трявна (4).jpg',
    '/Photos/враца (1).jpeg',
    '/Photos/враца (1).jpg',
    '/Photos/враца (2).jpg',
    '/Photos/враца (3).jpg',
    '/Photos/враца (4).jpg',
    '/Photos/враца (5).jpg',
    '/Photos/дания (1).jpeg',
    '/Photos/дания (2).jpeg',
    '/Photos/дания (3).jpeg',
    '/Photos/дания (4).jpeg',
    '/Photos/Море (1).jpg',
    '/Photos/Море (2).jpg',
    '/Photos/Море (3).jpg',
    '/Photos/Море (4).jpg',
    '/Photos/Море (5).jpg',
    '/Photos/Море (6).jpg',
    '/Photos/Море (7).jpg',
    '/Photos/Море (8).jpg',
    '/Photos/Море (9).jpg',
    '/Photos/Море (10).jpg',
    '/Photos/Море (11).jpg',
    '/Photos/Море (12).jpg',
    '/Photos/Море (13).jpg',
    '/Photos/Море (14).jpg',
    '/Photos/Море (15).jpg',
    '/Photos/Море (16).jpg',
    '/Photos/Море (17).jpg',
    '/Photos/Море (18).jpg',
    '/Photos/Море (19).jpg',
    '/Photos/Море (20).jpg',
    '/Photos/Море (21).jpg',
    '/Photos/Море (22).jpg',
    '/Photos/Море (23).jpg',
    '/Photos/Море (24).jpg',
    '/Photos/Море (25).jpg',
    '/Photos/Море (26).jpg',
    '/Photos/Море (27).jpg',
    '/Photos/Море (28).jpg',
    '/Photos/Море (29).jpg',
    '/Photos/Море (30).jpg',
    '/Photos/Море (31).jpg',
    '/Photos/Море (32).jpg',
    '/Photos/Море (33).jpg',
    '/Photos/Море (34).jpg',
    '/Photos/Море (35).jpg',
    '/Photos/Море (36).jpg',
    '/Photos/Море (37).jpg',
    '/Photos/Море (38).jpg',
    '/Photos/Море (39).jpg',
    '/Photos/Море (40).jpg',
    '/Photos/Море (41).jpg',
    '/Photos/Море (42).jpg',
    '/Photos/Море (43).jpg',
    '/Photos/Море (44).jpg',
    '/Photos/Море (45).jpg',
    '/Photos/Море (46).jpg',
    '/Photos/Море (47).jpg',
    '/Photos/Море (48).jpg',
];

const captions = [
    'Този ден беше луд.',
    'Пак бих го повторил.',
    'Без план. Перфектно.',
    'Точно така трябваше да бъде.',
    'Не го планирахме. Стана идеално.',
    'Един от любимите ми дни.',
    'Да можех да върна времето...',
    'Това е нашето.',
    'Сякаш вчера беше.',
    'Никога няма да забравя.',
    'Моментът, който спря времето.',
    'Хвани ме, докато падам.',
    'Най-добрият отбор.',
    'Нашата версия на щастието.',
    'Без думи. Само усещане.',
];

function PhotoSphere({ photos, onPhotoClick }) {
    const groupRef = useRef();
    const textureRefs = useRef([]);

    // Position photos on a sphere
    const photoData = useMemo(() => {
        const count = Math.min(photos.length, 40);
        return photos.slice(0, count).map((src, i) => {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const radius = 5;

            return {
                src,
                position: [
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(phi),
                ],
                rotation: [0, Math.atan2(
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.cos(phi)
                ), 0],
            };
        });
    }, [photos]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.08;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {photoData.map((photo, i) => (
                <PhotoPlane
                    key={i}
                    src={photo.src}
                    position={photo.position}
                    onClick={() => onPhotoClick(photo.src)}
                />
            ))}

            {/* Central glow */}
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.08}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

function PhotoPlane({ src, position, onClick }) {
    const meshRef = useRef();
    const [texture, setTexture] = useState(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(src, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
        });
    }, [src]);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.lookAt(0, 0, 0);
            const targetScale = hovered ? 1.2 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
            <planeGeometry args={[0.8, 0.6]} />
            {texture ? (
                <meshBasicMaterial
                    map={texture}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                />
            ) : (
                <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} side={THREE.DoubleSide} />
            )}
        </mesh>
    );
}

function BackgroundStars() {
    const count = 1000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 20 + Math.random() * 50;
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
            <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.4} sizeAttenuation />
        </points>
    );
}

export default function MemoryEngine({ onContinue }) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [caption, setCaption] = useState('');
    const [showBtn, setShowBtn] = useState(false);
    const containerRef = useRef(null);
    const overlayRef = useRef(null);
    const btnRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 });
        const t = setTimeout(() => setShowBtn(true), 3000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (showBtn && btnRef.current) {
            gsap.fromTo(btnRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 });
        }
    }, [showBtn]);

    const handlePhotoClick = (src) => {
        setSelectedPhoto(src);
        setCaption(captions[Math.floor(Math.random() * captions.length)]);
    };

    const closePhoto = () => {
        if (overlayRef.current) {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => setSelectedPhoto(null),
            });
        }
    };

    useEffect(() => {
        if (selectedPhoto && overlayRef.current) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        }
    }, [selectedPhoto]);

    const handleContinue = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            onComplete: onContinue,
        });
    };

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0, opacity: 0 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <color attach="background" args={['#050510']} />
                <ambientLight intensity={0.5} />
                <PhotoSphere photos={allPhotos} onPhotoClick={handlePhotoClick} />
                <BackgroundStars />
                <EffectComposer>
                    <Bloom intensity={0.6} luminanceThreshold={0.3} radius={0.5} />
                    <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette eskil={false} offset={0.2} darkness={0.6} />
                </EffectComposer>
            </Canvas>

            {/* Title */}
            <div style={{
                position: 'absolute',
                top: '5vh',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 10,
                pointerEvents: 'none',
            }}>
                <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.2rem',
                    fontWeight: 300,
                    color: '#a0a0cc',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                }}>
                    Спомени
                </div>
            </div>

            {/* Fullscreen photo overlay */}
            {selectedPhoto && (
                <div
                    ref={overlayRef}
                    className="memory-fullscreen visible"
                    onClick={closePhoto}
                    style={{ opacity: 0 }}
                >
                    <img src={selectedPhoto} alt="" />
                    <div className="memory-caption">{caption}</div>
                </div>
            )}

            {/* Continue button */}
            {showBtn && (
                <button
                    ref={btnRef}
                    className="narrative-btn"
                    style={{
                        position: 'absolute',
                        bottom: '5vh',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        opacity: 0,
                    }}
                    onClick={handleContinue}
                >
                    Продължи
                </button>
            )}
        </div>
    );
}

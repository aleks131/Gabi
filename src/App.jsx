import React, { useState, useCallback } from 'react';
import LoginGate from './components/LoginGate';
import FireworksScene from './scenes/FireworksScene';
import EarthScene from './scenes/EarthScene';
import GalleryScene from './scenes/GalleryScene';
import VratsaReturn from './scenes/VratsaReturn';
import MemoryEngine from './scenes/MemoryEngine';
import FinalSequence from './scenes/FinalSequence';
import BirthdayWish from './scenes/BirthdayWish';
import ForeverScreen from './scenes/ForeverScreen';
import audioEngine from './AudioEngine';

export default function App() {
    const [scene, setScene] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    // 0=login, 1=fireworks, 2=earth, 3=belogradchik, 4=tryavna
    // 5=crete, 6=vratsa-gallery, 7=vratsa-return, 8=denmark
    // 9=memory, 10=final, 11=birthday-wish, 12=forever-screen

    const goToScene = useCallback((nextScene) => {
        if (transitioning) return;
        setTransitioning(true);

        switch (nextScene) {
            case 1:
                audioEngine.fadeIn('chernova', 3000);
                break;
            case 3:
                audioEngine.crossFade('chernova', 'hero', 2000);
                break;
            case 4:
                audioEngine.crossFade('hero', 'da_sme_tam', 2000);
                break;
            case 5:
                // Greek song for Crete
                audioEngine.crossFade('da_sme_tam', 'afou', 2000);
                break;
            case 6:
                // Vratsa gallery — silence for emotional weight
                audioEngine.silence(2000);
                break;
            case 7:
                // Vratsa return text — keep silence
                break;
            case 8:
                // Denmark — "Наш плаж"
                audioEngine.play('nash_plaj', 2000);
                break;
            case 9:
                // Memory engine — continue
                break;
            case 10:
                audioEngine.crossFade('nash_plaj', 'chernova', 2000);
                break;
            case 11:
                // Birthday wish — continue Chernova softly
                break;
        }

        setTimeout(() => {
            setScene(nextScene);
            setTransitioning(false);
        }, 1200);
    }, [transitioning]);

    const handleLoginSuccess = useCallback(() => {
        goToScene(1);
    }, [goToScene]);

    const galleryConfigs = {
        3: {
            title: 'Белоградчик',
            images: ['/Photos/балон.jpg'],
            videos: ['/Photos/балон.mp4'],
            texts: ['Първата ни авантюра.'],
            colorTone: 'neutral',
        },
        4: {
            title: 'Трявна',
            images: [
                '/Photos/трявна.jpg',
                '/Photos/трявна (2).jpg',
                '/Photos/трявна (3).jpg',
                '/Photos/трявна (4).jpg',
            ],
            videos: [],
            texts: ['Тук спря времето.'],
            colorTone: 'neutral',
        },
        5: {
            title: 'Крит',
            images: [
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
            ],
            videos: [
                '/Photos/Море (1).mp4',
                '/Photos/Море (2).mp4',
                '/Photos/Море (3).mp4',
                '/Photos/Море (4).mp4',
            ],
            texts: ['Морето помни.'],
            colorTone: 'warm',
        },
        6: {
            title: 'Враца',
            subtitle: 'Откъдето тръгна всичко.',
            images: [
                '/Photos/враца (1).jpeg',
                '/Photos/враца (1).jpg',
                '/Photos/враца (2).jpg',
                '/Photos/враца (3).jpg',
                '/Photos/враца (4).jpg',
                '/Photos/враца (5).jpg',
            ],
            videos: [],
            texts: ['Нашето начало.'],
            colorTone: 'neutral',
        },
        8: {
            title: 'Дания',
            subtitle: 'Тя дойде при мен.',
            images: [
                '/Photos/дания (1).jpeg',
                '/Photos/дания (2).jpeg',
                '/Photos/дания (3).jpeg',
                '/Photos/дания (4).jpeg',
            ],
            videos: [],
            texts: ['Дойде при мен.'],
            colorTone: 'cold',
        },
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#050510' }}>
            {scene === 0 && (
                <LoginGate onSuccess={handleLoginSuccess} />
            )}

            {scene === 1 && (
                <FireworksScene onComplete={() => goToScene(2)} />
            )}

            {scene === 2 && (
                <EarthScene onContinue={() => goToScene(3)} />
            )}

            {[3, 4, 5, 6, 8].includes(scene) && (
                <GalleryScene
                    key={scene}
                    config={galleryConfigs[scene]}
                    onContinue={() => {
                        if (scene === 5) goToScene(6);      // Crete → Vratsa gallery
                        else if (scene === 6) goToScene(7);  // Vratsa gallery → Vratsa return
                        else if (scene === 8) goToScene(9);  // Denmark → Memory
                        else goToScene(scene + 1);           // Others → next
                    }}
                />
            )}

            {scene === 7 && (
                <VratsaReturn onComplete={() => goToScene(8)} />
            )}

            {scene === 9 && (
                <MemoryEngine onContinue={() => goToScene(10)} />
            )}

            {scene === 10 && (
                <FinalSequence onComplete={() => goToScene(11)} />
            )}

            {scene === 11 && (
                <BirthdayWish onComplete={() => goToScene(12)} />
            )}

            {scene === 12 && (
                <ForeverScreen onReplay={() => {
                    audioEngine.stopAll();
                    setScene(1);
                    audioEngine.fadeIn('chernova', 3000);
                }} />
            )}

            {/* Global transition overlay */}
            {transitioning && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: '#050510',
                    zIndex: 200,
                    animation: 'fadeInOut 1.2s ease-in-out',
                    pointerEvents: 'none',
                }} />
            )}

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    40% { opacity: 1; }
                    60% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

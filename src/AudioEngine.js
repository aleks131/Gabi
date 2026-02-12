import { Howl } from 'howler';

class AudioEngine {
    constructor() {
        this.tracks = {};
        this.currentTrack = null;
        this.isMuted = false;

        // Track definitions
        const trackMap = {
            chernova: '/Songs/Чернова.mp3',
            hero: '/Songs/Hero.mp3',
            da_sme_tam: '/Songs/Да сме там.mp3',
            nash_plaj: '/Songs/Наш плаж.mp3',
            afou: '/Songs/Αφού σε βρήκα δε σ\' αφήνω.mp3',
        };

        Object.entries(trackMap).forEach(([key, src]) => {
            this.tracks[key] = new Howl({
                src: [src],
                loop: true,
                volume: 0,
                preload: true,
            });
        });
    }

    play(trackName, fadeDuration = 2000) {
        const track = this.tracks[trackName];
        if (!track) return;

        if (this.currentTrack && this.currentTrack !== trackName) {
            this.fadeOut(this.currentTrack, fadeDuration);
        }

        if (!track.playing()) {
            track.play();
        }
        track.fade(track.volume(), this.isMuted ? 0 : 0.6, fadeDuration);
        this.currentTrack = trackName;
    }

    fadeIn(trackName, duration = 2000) {
        const track = this.tracks[trackName];
        if (!track) return;

        if (!track.playing()) {
            track.play();
        }
        track.fade(0, this.isMuted ? 0 : 0.6, duration);
        this.currentTrack = trackName;
    }

    fadeOut(trackName, duration = 2000) {
        const track = this.tracks[trackName];
        if (!track) return;

        track.fade(track.volume(), 0, duration);
        setTimeout(() => {
            if (track.volume() === 0) {
                track.pause();
            }
        }, duration + 100);
    }

    crossFade(fromTrack, toTrack, duration = 2000) {
        this.fadeOut(fromTrack, duration);
        setTimeout(() => {
            this.fadeIn(toTrack, duration);
        }, duration * 0.3);
    }

    stopAll() {
        Object.values(this.tracks).forEach(track => {
            track.stop();
        });
        this.currentTrack = null;
    }

    silence(duration = 2000) {
        if (this.currentTrack) {
            this.fadeOut(this.currentTrack, duration);
        }
    }

    mute() {
        this.isMuted = true;
        Object.values(this.tracks).forEach(track => {
            track.volume(0);
        });
    }

    unmute() {
        this.isMuted = false;
        if (this.currentTrack) {
            const track = this.tracks[this.currentTrack];
            if (track) track.fade(0, 0.6, 500);
        }
    }
}

// Singleton
const audioEngine = new AudioEngine();
export default audioEngine;

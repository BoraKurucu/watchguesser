"use client";

export function playSound(type: 'correct' | 'incorrect' | 'timer') {
    if (typeof window === 'undefined') return null;
    const audio = new Audio(`/sounds/${type}.mp3`);

    if (type === 'correct') {
        audio.volume = 0.35;
    } else if (type === 'timer') {
        audio.volume = 0.4;
    } else {
        audio.volume = 0.5;
    }

    audio.play().catch(() => {
        // Ignore autoplay or load errors
    });

    return audio;
}

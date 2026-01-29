"use client";

import { useEffect, useRef } from "react";

export default function StartupSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasPlayed = useRef(false);

    useEffect(() => {
        if (hasPlayed.current) return;

        // Try to play sound
        const playSound = async () => {
            try {
                if (audioRef.current) {
                    audioRef.current.volume = 0.5;
                    await audioRef.current.play();
                    hasPlayed.current = true;
                }
            } catch (error) {
                // Auto-play might be blocked by browser
                console.log("Startup sound blocked", error);
            }
        };

        // Delay slightly
        const timer = setTimeout(playSound, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <audio
            ref={audioRef}
            src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" // Placeholder pleasant notification sound
            preload="auto"
        />
    );
}

"use client";


import { useEffect } from "react";
import { SOUNDS } from "@/lib/constants";



export function UseWelcomeSound() {
    useEffect(() => {
        const hasPlayed = sessionStorage.getItem("welcome_sound_played");
        if (hasPlayed) return;

        const sound = new Audio(SOUNDS.POP);
        sound.volume = 0.3;

        const playSound = async () => {
            try {
                await sound.play();
                sessionStorage.setItem("welcome_sound_played", "true");
            } catch {
                // Autoplay blocked
            }
        };

        // Try immediate play (often blocked)
        playSound();

        const handleInteraction = () => {
            playSound();
            // Once we try to play on interaction, we can remove the listener
            // regardless of success to avoid annoying the user.
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);
    return null;
}

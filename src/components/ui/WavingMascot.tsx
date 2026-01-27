"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SOUNDS } from "@/lib/constants";

export function WavingMascot() {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("Welcome back! 👋");

    useEffect(() => {
        // Show after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true);
            // Play gentle pop sound
            try {
                const audio = new Audio(SOUNDS.POP);
                audio.volume = 0.2;
                audio.play().catch(() => { }); // Catch autoplay errors
            } catch { }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl rounded-br-none shadow-lg border border-slate-100 mb-4 animate-in fade-in zoom-in duration-300 origin-bottom-right relative max-w-[200px]">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -left-2 bg-slate-100 hover:bg-slate-200 rounded-full p-1 text-slate-500 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
                <p className="text-sm text-slate-700 font-medium">
                    {message}
                </p>
            </div>
            <div
                className="text-5xl cursor-pointer hover:scale-110 transition-transform duration-200 filter drop-shadow-md origin-bottom"
                onMouseEnter={() => setMessage("Need help? Click me!")}
                onMouseLeave={() => setMessage("Welcome back! 👋")}
                onClick={() => {
                    const audio = new Audio(SOUNDS.POP);
                    audio.volume = 0.2;
                    audio.play().catch(() => { });
                }}
            >
                <div className="animate-wave inline-block">
                    🦊
                </div>
            </div>
        </div>
    );
}

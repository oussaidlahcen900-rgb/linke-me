"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            // Typically show iOS instructions after some time or interaction
            // ignoring auto-show for now to be less intrusive
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We no longer need the prompt.  Clear it up
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible && !isIOS) return null;

    // Custom iOS Instructions (simplified)
    if (isIOS) {
        // We can return null here to not annoy iOS users, or show a specific banner
        // returning null for now to focus on the standard install flow first
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Install Linke-Me</h3>
                    <p className="text-xs text-slate-300">Add to Home Screen for the best experience.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/10 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition whitespace-nowrap"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}

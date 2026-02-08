"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { UserProfile } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PartyPopper, Check } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function WelcomeDialog() {
    const { user, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show if user exists, has a profile, and has NOT seen welcome yet
        if (user && profile && !profile.hasSeenWelcome) {
            // Use setTimeout to avoid cascading renders
            setTimeout(() => {
                setIsOpen(true);
                triggerConfetti();
            }, 0);
        }
    }, [user, profile]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleClose = async () => {
        setIsOpen(false);
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                hasSeenWelcome: true
            });
        } catch (error) {
            console.error("Error updating welcome status:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 text-center relative">

                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 pb-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl relative z-10 animate-bounce">
                        <PartyPopper className="w-10 h-10 text-blue-600" />
                    </div>
                </div>

                <div className="px-8 pb-8 -mt-10 relative z-10">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome, {profile?.displayName?.split(' ')[0] || "Friend"}!</h2>
                    <p className="text-slate-600 mb-6">
                        We&apos;re so happy you&apos;re here. Connect with your city, find opportunities, and grow your network.
                    </p>

                    <div className="space-y-3 mb-6 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3" /></div>
                            <span>Set up your profile &amp; location</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Check className="w-3 h-3" /></div>
                            <span>Connect with locals</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0"><Check className="w-3 h-3" /></div>
                            <span>Explore jobs &amp; services</span>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Let&apos;s Get Started 🚀
                    </button>
                </div>

            </div>
        </div>
    );
}

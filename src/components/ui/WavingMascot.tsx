"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SOUNDS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { getOrCreateBotConversation } from "@/lib/chatUtils";

export function WavingMascot() {
    const router = useRouter();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

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

    const handleMascotClick = async () => {
        // Play sound
        try {
            const audio = new Audio(SOUNDS.POP);
            audio.volume = 0.2;
            audio.play().catch(() => { });
        } catch { }

        if (user) {
            try {
                const conversationId = await getOrCreateBotConversation(user.uid);
                router.push(`/chat?id=${conversationId}`);
            } catch (error) {
                console.error("Failed to start bot chat", error);
                router.push("/chat"); // Fallback
            }
        } else {
            router.push("/login");
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-6 right-6 z-50 flex items-end gap-2"
                >
                    <motion.div
                        className="text-5xl cursor-pointer filter drop-shadow-md origin-bottom"
                        whileHover={{ scale: 1.1 }}
                        onClick={handleMascotClick}
                        title="Chat with Linke-Me Bot"
                    >
                        <motion.div
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{ display: "inline-block", transformOrigin: "70% 70%" }}
                        >
                            🦊
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const images = [
    "/hero/bg-1.jpg",
    "/hero/bg-2.jpg",
    "/hero/bg-3.jpg",
    "/hero/bg-4.jpg",
];

export default function BackgroundSlider() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={images[index]}
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
    );
}

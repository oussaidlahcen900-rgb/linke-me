"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage, direction } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'darija', label: 'المغربية', flag: '🇲🇦' },
    ];

    const currentFlag = languages.find(l => l.code === language)?.flag || '🌐';

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition ${className || 'text-slate-700 dark:text-slate-200'}`}
                title="Change Language"
            >
                <span className="text-lg">{currentFlag}</span>
                <Globe className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 ${direction === 'rtl' ? 'left-0' : 'right-0'}`}
                        >
                            <div className="py-1">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition
                      ${language === lang.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 dark:text-slate-200'}
                      ${direction === 'rtl' ? 'text-right flex-row-reverse' : 'text-left'}
                    `}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="flex-1">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

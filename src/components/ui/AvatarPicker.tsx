"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Dice5, Check, Sparkles, Wand2 } from "lucide-react";

interface AvatarPickerProps {
    currentAvatar: string;
    onSelect: (url: string) => void;
}

const AVATAR_STYLES = [
    { id: "avataaars", name: "People", emoji: "🧑" },
    { id: "adventurer", name: "Adventurers", emoji: "🧗" },
    { id: "notionists", name: "Notion", emoji: "📝" },
    { id: "open-peeps", name: "Doodles", emoji: "✏️" },
    { id: "bottts", name: "Robots", emoji: "🤖" },
    { id: "pixel-art", name: "Pixel", emoji: "👾" },
    { id: "lorelei", name: "Artistic", emoji: "🎨" },
    { id: "miniavs", name: "Mini", emoji: "👶" },
    { id: "fun-emoji", name: "Emojis", emoji: "😀" },
    { id: "micah", name: "Sketch", emoji: "🖊️" },
    { id: "personas", name: "Playful", emoji: "🎭" }
];

export default function AvatarPicker({ currentAvatar, onSelect }: AvatarPickerProps) {
    const [selectedStyle, setSelectedStyle] = useState("avataaars");
    const [magicInput, setMagicInput] = useState("");
    const [seeds, setSeeds] = useState<string[]>([]);

    // Regenerate seeds when style changes or manually shuffled
    useEffect(() => {
        generateRandomSeeds();
    }, [selectedStyle]);

    // If magic input exists, override seeds with just that one deterministic option + variations
    useEffect(() => {
        if (magicInput.trim()) {
            // Generate variations based on the name
            const base = magicInput.trim().toLowerCase().replace(/\s+/g, '-');
            setSeeds([
                base,
                `${base}-happy`, `${base}-cool`, `${base}-pro`,
                `${base}-1`, `${base}-2`, `${base}-3`, `${base}-4`,
                `${base}-x`, `${base}-y`, `${base}-z`, `${base}-final`
            ]);
        } else {
            generateRandomSeeds();
        }
    }, [magicInput]);

    const generateRandomSeeds = () => {
        setSeeds(Array.from({ length: 12 }, () => Math.random().toString(36).substring(7)));
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Header / Magic Input */}
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                    <input
                        type="text"
                        placeholder="Type your name to generate unique avatars..."
                        value={magicInput}
                        onChange={(e) => setMagicInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition text-sm"
                    />
                </div>
            </div>

            {/* Style Selector */}
            <div>
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar snap-x">
                    {AVATAR_STYLES.map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedStyle(style.id)}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border snap-start",
                                selectedStyle === style.id
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            <span>{style.emoji}</span>
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Avatar Grid */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {magicInput ? `Generating for "${magicInput}"` : "Random Suggestions"}
                    </span>
                    {!magicInput && (
                        <button onClick={generateRandomSeeds} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                            <Dice5 className="w-3 h-3" /> Shuffle
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {seeds.map((seed) => {
                        const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                        const isSelected = currentAvatar === avatarUrl;

                        return (
                            <button
                                key={seed}
                                type="button"
                                onClick={() => onSelect(avatarUrl)}
                                className={clsx(
                                    "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 group bg-slate-50",
                                    isSelected
                                        ? "border-blue-600 ring-2 ring-blue-100 scale-105 shadow-lg shadow-blue-500/10"
                                        : "border-slate-100 hover:border-slate-300 hover:scale-105 hover:shadow-md"
                                )}
                            >
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in zoom-in">
                                        <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

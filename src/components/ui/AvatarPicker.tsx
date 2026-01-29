"use client";

import { useState } from "react";
import clsx from "clsx";
import { Dice5, Check } from "lucide-react";

interface AvatarPickerProps {
    currentAvatar: string;
    onSelect: (url: string) => void;
}

const AVATAR_STYLES = [
    { id: "avataaars", name: "People" },
    { id: "bottts", name: "Robots" },
    { id: "adventurer", name: "Adventurers" },
    { id: "lorelei", name: "Artistic" },
    { id: "fun-emoji", name: "Emojis" },
    { id: "notionists", name: "Notion" }
];

export default function AvatarPicker({ currentAvatar, onSelect }: AvatarPickerProps) {
    const [selectedStyle, setSelectedStyle] = useState("avataaars");
    const [seeds, setSeeds] = useState<string[]>(Array.from({ length: 12 }, (_, i) => `seed-${i}`));

    const generateNewSeeds = () => {
        setSeeds(Array.from({ length: 12 }, () => Math.random().toString(36).substring(7)));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Choose an Avatar</label>
                <button
                    type="button"
                    onClick={generateNewSeeds}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                    <Dice5 className="w-3 h-3" />
                    Shuffle
                </button>
            </div>

            {/* Style Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {AVATAR_STYLES.map((style) => (
                    <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.id)}
                        className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border",
                            selectedStyle === style.id
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {style.name}
                    </button>
                ))}
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {seeds.map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`;
                    const isSelected = currentAvatar === avatarUrl;

                    return (
                        <button
                            key={seed}
                            type="button"
                            onClick={() => onSelect(avatarUrl)}
                            className={clsx(
                                "relative aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 bg-slate-50",
                                isSelected ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-300"
                            )}
                        >
                            <img
                                src={avatarUrl}
                                alt="Avatar option"
                                className="w-full h-full object-cover"
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                    <div className="bg-blue-600 text-white p-1 rounded-full shadow-sm">
                                        <Check className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import React from "react";
import Link from "next/link";

interface LinkifyProps {
    text: string;
    className?: string;
}

export default function Linkify({ text, className = "" }: LinkifyProps) {
    if (!text) return null;

    // URL Regex matching http/https
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering card clicks
                        >
                            {part}
                        </a>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
}

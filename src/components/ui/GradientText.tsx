import React from 'react';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    from?: string;
    via?: string;
    to?: string;
}

export function GradientText({
    children,
    className = "",
    from = "from-blue-600",
    via = "via-teal-500",
    to = "to-blue-400"
}: GradientTextProps) {
    return (
        <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${from} ${via} ${to} animate-gradient bg-[length:200%_auto] ${className}`}
        >
            {children}
        </span>
    );
}

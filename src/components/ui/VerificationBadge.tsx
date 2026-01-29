import { BadgeCheck } from "lucide-react";

export function VerificationBadge({ size = 16 }: { size?: number }) {
    return (
        <BadgeCheck
            className="text-blue-500 fill-blue-500/10 inline-block ml-1 align-text-bottom"
            size={size}
            strokeWidth={2.5}
        />
    );
}

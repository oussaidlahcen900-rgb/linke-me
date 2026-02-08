"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { Bookmark, SquareActivity } from "lucide-react";

export default function FeedProfileCard() {
    const { user, profile } = useAuth();

    // Fallback values
    const displayName = profile?.displayName || user?.displayName || "Guest User";
    const headline = profile?.headline || "Welcome to Linke-Me";
    const photoURL = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
    const backgroundGradient = "bg-gradient-to-r from-slate-400 to-slate-500"; // LinkedIn-ish grey/neutral or use brand colors

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            {/* Cover Image */}
            <div className={`h-16 ${backgroundGradient} relative`}></div>

            {/* Profile Info */}
            <div className="px-4 pb-4 text-center relative">
                <Link href="/profile" className="inline-block relative -mt-8 mb-3">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                        <img
                            src={photoURL}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </Link>

                <Link href="/profile" className="block hover:underline decoration-1 decoration-slate-900">
                    <h2 className="font-semibold text-slate-900 text-base flex items-center justify-center gap-1">
                        {displayName}
                        {profile?.isVerified && <VerificationBadge size={14} />}
                    </h2>
                </Link>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{headline}</p>
            </div>

            <div className="border-t border-slate-100 py-3">
                <div className="px-4 py-1 hover:bg-slate-50 cursor-pointer transition">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-500">Profile viewers</span>
                        <span className="text-blue-600">42</span>
                    </div>
                </div>
                <div className="px-4 py-1 hover:bg-slate-50 cursor-pointer transition">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-500">Post impressions</span>
                        <span className="text-blue-600">128</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100">
                <Link href="/items" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                    <Bookmark className="w-4 h-4 text-slate-500" />
                    <span>My Items</span>
                </Link>
            </div>
        </div>
    );
}

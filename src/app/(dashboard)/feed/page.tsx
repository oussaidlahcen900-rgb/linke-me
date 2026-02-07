"use client";

import CreatePost from "@/components/feed/CreatePost";
import PostList from "@/components/feed/PostList";
import { MapPin, Briefcase, ShieldCheck } from "lucide-react"; // Import ShieldCheck for Admin link if needed, but here we need Badge
import { useAuth } from "@/context/AuthContext";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import Link from "next/link"; // For linking to profile

import { useLanguage } from "@/context/LanguageContext";

export default function FeedPage() {
    const { user, profile } = useAuth();
    const { t } = useLanguage();

    const getRoleLabel = (role?: string) => {
        if (role === 'owner') return t('roleOwner');
        if (role === 'admin') return t('roleAdmin');
        return t('roleMember');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
            {/* Sidebar - Profile Summary */}
            <aside className="hidden md:block w-72 space-y-4 flex-shrink-0">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center sticky top-24">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Link href="/profile" className="hover:underline">
                        <h2 className="font-bold text-lg text-slate-800 flex items-center justify-center gap-1">
                            {profile?.displayName || user?.displayName || t('guestUser')}
                            {profile?.isVerified && <VerificationBadge size={16} />}
                        </h2>
                    </Link>
                    <p className="text-sm text-slate-500 mb-4">{profile?.headline || t('welcomeMessage')}</p>

                    <div className="text-left space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{profile?.city || t('unknownLocation')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>{getRoleLabel(profile?.role)}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content - Feed */}
            <main className="flex-1 min-w-0">
                <CreatePost />
                <PostList />
            </main>

            {/* Right Sidebar - Suggestions (Optional placeholder) */}
            <aside className="hidden lg:block w-72">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-700 mb-3">{t('suggestedForYou')}</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Local Business {i}</p>
                                    <p className="text-xs text-slate-500">{t('promoted')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

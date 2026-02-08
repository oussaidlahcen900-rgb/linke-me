"use client";

import { Bell, Search, MapPin, Menu, X, Home, Briefcase, Wrench, GraduationCap, User, MessageSquare, LogOut, QrCode, Users } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/layout/SearchBar";
import { useAuth } from "@/context/AuthContext";
import ShareDialog from "./ShareDialog";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { user, profile, signOut } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.uid),
            where("read", "==", false)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });
        return () => unsubscribe();
    }, [user]);

    const navItems = [
        { name: t('feed'), href: "/feed", icon: Home },
        { name: t('myNetwork'), href: "/network", icon: Users },
        { name: t('jobs'), href: "/jobs", icon: Briefcase },
        { name: t('services'), href: "/services", icon: Wrench },
        { name: t('learning'), href: "/learning", icon: GraduationCap },
        { name: t('notifications'), href: "/notifications", icon: Bell, badge: unreadCount },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">

                {/* Logo & Search */}
                <div className="flex items-center gap-4">
                    <Link href="/feed" className="flex-shrink-0">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hidden md:block">
                            LinkeMe
                        </h1>
                        <div className="w-9 h-9 bg-blue-600 rounded text-center flex items-center justify-center text-white font-bold text-xl md:hidden">
                            L
                        </div>
                    </Link>
                    <div className="hidden lg:block w-64 transition-all duration-300 focus-within:w-80">
                        <SearchBar />
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition md:hidden"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
                    </button>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 lg:gap-6 h-full">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center h-full px-2 lg:px-3 min-w-[60px] lg:min-w-[80px] relative border-b-2 transition-all duration-200 group hover:text-slate-900",
                                    isActive
                                        ? "border-slate-900 text-slate-900"
                                        : "border-transparent text-slate-500"
                                )}
                            >
                                <div className="relative">
                                    <item.icon className={clsx("h-6 w-6 mb-0.5 transition-colors", isActive ? "fill-slate-900" : "group-hover:fill-slate-300")} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] lg:text-xs font-medium truncate max-w-full text-center hidden lg:block">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4 border-l border-slate-100 pl-2 lg:pl-6 ml-2 lg:ml-0 h-full">
                    <Link href="/chat" className="flex flex-col items-center justify-center h-full px-2 text-slate-500 hover:text-slate-900 min-w-[50px]">
                        <MessageSquare className="h-6 w-6 mb-0.5" />
                        <span className="text-[10px] lg:text-xs font-medium hidden lg:block">{t('messages')}</span>
                    </Link>

                    <Link href="/profile" className="flex flex-col items-center justify-center h-full px-2 text-slate-500 hover:text-slate-900 min-w-[50px]">
                        <div className="w-6 h-6 rounded-full overflow-hidden mb-0.5 ring-1 ring-slate-200">
                            <img
                                src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || user?.email || 'User'}`}
                                alt="Me"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-[10px] lg:text-xs font-medium hidden lg:block flex items-center gap-0.5">
                            {t('me')}
                        </span>
                    </Link>

                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="hidden md:flex flex-col items-center justify-center h-full px-2 text-amber-700 hover:text-amber-800 min-w-[60px]"
                    >
                        <QrCode className="h-6 w-6 mb-0.5" />
                        <span className="text-[10px] lg:text-xs font-medium hidden lg:block max-w-[70px] leading-tight text-center underline decoration-amber-300/50">
                            Try Premium
                        </span>
                    </button>

                    {/* Mobile Only Menu Trigger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-600 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <ShareDialog
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                city={profile?.city}
            />

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col pt-16 animate-in slide-in-from-right duration-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-lg">Menu</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-6 w-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Profile Section Mobile */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                            <Link href="/profile" className="flex items-center gap-3 w-full">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm">
                                    <img
                                        src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{profile?.displayName || "User"}</p>
                                    <p className="text-sm text-slate-500">View Profile</p>
                                </div>
                            </Link>
                        </div>

                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                            >
                                <item.icon className="h-6 w-6 text-slate-500" />
                                <span className="font-medium text-lg">{item.name}</span>
                            </Link>
                        ))}
                        <Link
                            href="/chat"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                        >
                            <MessageSquare className="h-6 w-6 text-slate-500" />
                            <span className="font-medium text-lg">{t('messages')}</span>
                        </Link>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
                            >
                                <LogOut className="h-6 w-6" />
                                <span className="font-medium text-lg">{t('signOut')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header >
    );
}

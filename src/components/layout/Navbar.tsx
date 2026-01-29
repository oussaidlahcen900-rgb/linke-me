"use client";

import { Bell, Search, MapPin, Menu, X, Home, Briefcase, Wrench, GraduationCap, User, MessageSquare } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/layout/SearchBar";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, profile } = useAuth();

    const navItems = [
        { name: "My Feed", href: "/feed", icon: Home },
        { name: "Jobs", href: "/jobs", icon: Briefcase },
        { name: "Services", href: "/services", icon: Wrench },
        { name: "Learning", href: "/learning", icon: GraduationCap },
        { name: "Messages", href: "/chat", icon: MessageSquare },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md">
            <div className="flex items-center gap-4 lg:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <Link href="/feed" className="text-xl font-bold text-blue-600">LinkeMe</Link>
            </div>

            <div className="hidden max-w-md flex-1 lg:block">
                <SearchBar />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {profile?.city && (
                    <button className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{profile.city}</span>
                    </button>
                )}

                <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <Link href="/profile" className="h-8 w-8 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white cursor-pointer hover:ring-blue-100 transition">
                    <img
                        src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || user?.email || 'User'}`}
                        alt={profile?.displayName || "User"}
                        className="w-full h-full object-cover"
                    />
                </Link>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg lg:hidden flex flex-col p-4 animate-in slide-in-from-top-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                        >
                            <item.icon className="h-5 w-5 text-slate-400" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                    {profile?.city && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <button className="flex items-center gap-2 px-4 py-3 text-slate-600 w-full">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">{profile.city}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

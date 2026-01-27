"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, CheckCircle, BookOpen, User, Bell } from "lucide-react";
import clsx from "clsx";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

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

    const links = [
        { name: "Feed", href: "/feed", icon: Home },
        { name: "Jobs", href: "/jobs", icon: Briefcase },
        { name: "Services", href: "/services", icon: CheckCircle },
        { name: "Learning", href: "/learning", icon: BookOpen },
        {
            name: "Notifications",
            href: "/notifications",
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        { name: "My Profile", href: "/profile", icon: User },
        // { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                    Linke-Me
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`} />
                                <span className="font-medium">{link.name}</span>
                            </div>
                            {link.badge && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md shadow-red-200">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
            {/* User footer... */}
            <div className="p-4 border-t border-slate-100">
                {/* ... */}
            </div>
        </aside>
    );
}

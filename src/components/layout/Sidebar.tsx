"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Wrench, GraduationCap, User } from "lucide-react";
import clsx from "clsx";

const navItems = [
    { name: "My Feed", href: "/feed", icon: Home },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Services", href: "/services", icon: Wrench },
    { name: "Learning", href: "/learning", icon: GraduationCap },
    { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm max-md:hidden">
            <div className="flex h-16 items-center border-b border-slate-100 px-6">
                <h1 className="text-2xl font-bold tracking-tight text-blue-600">Linke<span className="text-slate-900">Me</span></h1>
            </div>
            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={clsx("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

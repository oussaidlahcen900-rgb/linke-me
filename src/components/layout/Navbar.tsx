"use client";

import { Bell, Search, MapPin } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4 lg:hidden">
                {/* Mobile menu button placeholder */}
                <div className="h-8 w-8 rounded-md bg-slate-100"></div>
                <span className="text-xl font-bold text-blue-600">LinkeMe</span>
            </div>

            <div className="hidden max-w-md flex-1 lg:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search jobs, people, services..."
                        className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>New York, NY</span>
                </button>

                <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
                    {/* Avatar Placeholder */}
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </div>
        </header>
    );
}

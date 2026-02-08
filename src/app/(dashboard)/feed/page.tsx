"use client";

import CreatePost from "@/components/feed/CreatePost";
import PostList from "@/components/feed/PostList";
import FeedProfileCard from "@/components/feed/FeedProfileCard";
import NewsWidget from "@/components/feed/NewsWidget";
import { useAuth } from "@/context/AuthContext";

export default function FeedPage() {
    const { user } = useAuth();

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Sidebar - Profile Summary */}
            <aside className="hidden md:block md:col-span-3 lg:col-span-3 space-y-4">
                <FeedProfileCard />
            </aside>

            {/* Main Content - Feed */}
            <main className="col-span-1 md:col-span-9 lg:col-span-6 min-w-0 space-y-4">
                <CreatePost />
                <div className="flex items-center justify-between mb-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="px-2 text-xs text-slate-500 font-medium">Sort by: <span className="text-slate-900 font-bold">Top</span></span>
                </div>
                <PostList />
            </main>

            {/* Right Sidebar - Widgets */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
                <NewsWidget />

                {/* Footer Links Placeholder */}
                <div className="text-center text-xs text-slate-500 px-4">
                    <p className="mb-2">LinkeMe © 2024</p>
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                        <a href="#" className="hover:underline hover:text-blue-600">About</a>
                        <a href="#" className="hover:underline hover:text-blue-600">Accessibility</a>
                        <a href="#" className="hover:underline hover:text-blue-600">Help Center</a>
                        <a href="#" className="hover:underline hover:text-blue-600">Privacy & Terms</a>
                    </div>
                </div>
            </aside>
        </div>
    );
}

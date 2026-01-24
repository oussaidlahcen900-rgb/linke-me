"use client";

import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostList from "@/components/feed/PostList";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export default function ProfilePage() {
    const { user, profile, loading } = useAuth();
    const [postCount, setPostCount] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            if (user) {
                const q = query(collection(db, "posts"), where("authorId", "==", user.uid));
                const snapshot = await getCountFromServer(q);
                setPostCount(snapshot.data().count);
            }
        }
        fetchStats();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    if (!user || !profile) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">Please log in to view your profile.</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader profile={profile} postCount={postCount} />

            <div className="flex gap-6">
                {/* Left Sidebar - About */}
                <aside className="w-1/3 hidden md:block space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">About</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {profile.bio || "Write a short bio to introduce yourself to the community."}
                        </p>
                    </div>
                </aside>

                {/* Main Content - User's Posts */}
                <main className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">My Activity</h3>
                    <PostList userId={user.uid} />
                </main>
            </div>
        </div>
    );
}

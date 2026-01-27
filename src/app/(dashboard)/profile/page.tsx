"use client";

import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostList from "@/components/feed/PostList";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { UserProfile } from "@/types";
import { Loader2 } from "lucide-react";

function ProfileContent() {
    const { user, profile: myProfile, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const targetUid = searchParams.get("uid");

    const [displayedProfile, setDisplayedProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [postCount, setPostCount] = useState(0);

    // Determine whose profile to show
    useEffect(() => {
        if (authLoading) return;

        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                // Case 1: Viewing my own profile (default or explicit ID)
                if (!targetUid || (user && targetUid === user.uid)) {
                    setDisplayedProfile(myProfile);
                }
                // Case 2: Viewing someone else
                else if (targetUid) {
                    const userDoc = await getDoc(doc(db, "users", targetUid));
                    if (userDoc.exists()) {
                        setDisplayedProfile(userDoc.data() as UserProfile);
                    } else {
                        setDisplayedProfile(null); // Not found
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [user, myProfile, targetUid, authLoading]);

    // Fetch stats for the DISPLAYED user
    useEffect(() => {
        async function fetchStats() {
            if (displayedProfile?.uid) {
                try {
                    const q = query(collection(db, "posts"), where("authorId", "==", displayedProfile.uid));
                    const snapshot = await getCountFromServer(q);
                    setPostCount(snapshot.data().count);
                } catch (e) {
                    console.error("Error fetching stats:", e);
                }
            }
        }
        fetchStats();
    }, [displayedProfile]);

    if (authLoading || loadingProfile) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (!displayedProfile) {
        return (
            <div className="p-20 text-center text-slate-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">User not found</h2>
                <p>The profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader profile={displayedProfile} postCount={postCount} />

            <div className="flex gap-6">
                {/* Left Sidebar - About */}
                <aside className="w-1/3 hidden md:block space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">About</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {displayedProfile.bio || "No bio available."}
                        </p>
                    </div>
                </aside>

                {/* Main Content - User's Posts */}
                <main className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Activity</h3>
                    <PostList userId={displayedProfile.uid} />
                </main>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}

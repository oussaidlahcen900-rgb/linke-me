"use client";

import { UserProfile } from "@/types";
import { MapPin, Calendar, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import EditProfileDialog from "./EditProfileDialog";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProfileHeaderProps {
    profile: UserProfile;
    postCount: number;
}

import { startConversation } from "@/lib/chatUtils";
import { Loader2 } from "lucide-react";

// ... imports

export default function ProfileHeader({ profile, postCount }: ProfileHeaderProps) {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const isOwnProfile = currentUser?.uid === profile.uid;
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isMessageLoading, setIsMessageLoading] = useState(false);

    // Calculate Profile Completion
    const calculateCompletion = () => {
        let score = 0;
        if (profile.photoURL) score += 20;
        if (profile.displayName) score += 10;
        if (profile.headline) score += 10;
        if (profile.bio && profile.bio.length > 10) score += 20;
        if (profile.city) score += 10;
        if (profile.role) score += 10;
        if (profile.skills && profile.skills.length > 0) score += 20;
        return score;
    };
    const completionPercentage = calculateCompletion();

    const handleConnect = async () => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                following: isFollowing ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
            });
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error connecting:", error);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) return;

        try {
            setIsMessageLoading(true);
            const conversationId = await startConversation(currentUser.uid, profile.uid);
            router.push(`/chat?id=${conversationId}`);
        } catch (error) {
            console.error("Error starting conversation:", error);
            // Optionally show a toast error here
        } finally {
            setIsMessageLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative group">

            {/* ... Cover Image & Avatar ... */}
            <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                {isOwnProfile && (
                    <button className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition">
                        <Camera className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="px-4 pb-8 relative">
                <div className="flex flex-col items-center -mt-16 md:-mt-20 mb-4">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden relative z-10">
                            <img
                                src={profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`}
                                alt={profile.displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute bottom-2 right-2 z-20 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition hover:scale-110"
                                aria-label="Change profile photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Name & Badge */}
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
                            {profile.displayName || "User"}
                            {profile.isVerified && <VerificationBadge size={24} />}
                        </h1>
                        <p className="text-slate-600 font-medium mt-1 text-lg">
                            {profile.headline || profile.role || "Community Member"}
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-2 text-slate-500 text-sm">
                            {(!profile.hideBio || isOwnProfile) && (
                                <>
                                    {profile.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {profile.city}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date().getFullYear()}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Private Profile Message */}
                    {profile.hideBio && !isOwnProfile && (
                        <div className="mt-6 w-full max-w-md text-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto flex items-center justify-center mb-3">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-slate-400" strokeWidth="2">
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                </svg>
                            </div>
                            <h3 className="text-slate-900 font-bold">This profile is private</h3>
                            <p className="text-slate-500 text-sm mt-1">Bio and other details are hidden.</p>
                        </div>
                    )}

                    {/* Completion Indicator (Only for Owner) */}
                    {isOwnProfile && completionPercentage < 100 && (
                        <div className="mt-6 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-slate-600">Profile Strength</span>
                                <span className="text-xs font-bold text-blue-600">{completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 text-center">Add more details to increase visibility</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full md:w-auto justify-center px-4 md:px-0">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition shadow-sm hover:shadow-md active:scale-95"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleConnect}
                                    className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold transition shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 ${isFollowing
                                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button
                                    onClick={handleMessage}
                                    disabled={isMessageLoading}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-white text-slate-700 border border-slate-200 font-semibold rounded-full hover:bg-slate-50 transition shadow-sm active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isMessageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Message"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex justify-center gap-8 md:gap-16 border-t border-slate-100 pt-6 mt-2 max-w-lg mx-auto">
                    <div className="text-center group cursor-pointer">
                        <span className="block font-bold text-slate-900 text-xl group-hover:text-blue-600 transition">{postCount}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Posts</span>
                    </div>
                    <div className="text-center group cursor-pointer">
                        <span className="block font-bold text-slate-900 text-xl group-hover:text-blue-600 transition">0</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Followers</span>
                    </div>
                    <div className="text-center group cursor-pointer">
                        <span className="block font-bold text-slate-900 text-xl group-hover:text-blue-600 transition">0</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Following</span>
                    </div>
                </div>

            </div>

            <EditProfileDialog
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={profile}
            />
        </div>
    );
}

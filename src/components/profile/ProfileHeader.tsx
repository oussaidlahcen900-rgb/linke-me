"use client";

import { UserProfile } from "@/types";
import { MapPin, Calendar, Edit3, Briefcase, MessageSquare, UserPlus, Check, Linkedin, Github, Twitter, Globe, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import EditProfileDialog from "./EditProfileDialog";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface ProfileHeaderProps {
    profile: UserProfile;
    postCount: number;
}

export default function ProfileHeader({ profile, postCount }: ProfileHeaderProps) {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const isOwnProfile = currentUser?.uid === profile.uid;
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleConnect = async () => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            if (isFollowing) {
                await updateDoc(userRef, { following: arrayRemove(profile.uid) });
                setIsFollowing(false);
            } else {
                await updateDoc(userRef, { following: arrayUnion(profile.uid) });
                setIsFollowing(true);

                // Trigger Notification
                await addDoc(collection(db, "notifications"), {
                    recipientId: profile.uid,
                    senderId: currentUser.uid,
                    senderName: currentUser.displayName || "Someone",
                    senderAvatar: currentUser.photoURL,
                    type: "connect",
                    read: false,
                    createdAt: serverTimestamp(),
                    link: "/profile", // Link back to the follower's profile would be better if we had /user/[id]
                });
            }
        } catch (error) {
            console.error("Error connecting:", error);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) return;
        try {
            // Check for existing conversation with these 2 participants
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const existingConv = snapshot.docs.find(doc => {
                const data = doc.data();
                return data.participants.includes(profile.uid);
            });

            if (existingConv) {
                router.push(`/chat?id=${existingConv.id}`);
            } else {
                // Create new conversation
                const newConvRef = await addDoc(collection(db, "conversations"), {
                    participants: [currentUser.uid, profile.uid],
                    lastMessage: "",
                    lastMessageAt: serverTimestamp(),
                    unreadCount: {}
                });
                router.push(`/chat?id=${newConvRef.id}`);
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            {/* Cover Image Placeholder */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>

            {/* ... */}
            <div className="px-6 pb-6">
                <div className="flex justify-between items-start">
                    {/* ... (Avatar remains same) ... */}
                    <div className="-mt-12">
                        <img
                            src={profile.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile.uid}
                            alt={profile.displayName}
                            className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover"
                        />
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            // ... (Connect buttons remain same) ...
                            <>
                                <button
                                    onClick={handleConnect}
                                    className={`px-6 py-2 rounded-full font-semibold text-sm transition flex items-center gap-2 ${isFollowing
                                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                        }`}
                                >
                                    {isFollowing ? <><Check className="w-4 h-4" /> Connected</> : <><UserPlus className="w-4 h-4" /> Connect</>}
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="px-6 py-2 rounded-full font-semibold text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">{profile.displayName || "User"}</h1>
                    <p className="text-lg text-slate-600 mt-1">{profile.headline || "No headline yet"}</p>

                    {/* Social Links */}
                    {profile.socialLinks && (
                        <div className="flex gap-3 mt-3">
                            {profile.socialLinks.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profile.socialLinks.github && (
                                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#333] transition">
                                    <Github className="w-5 h-5" />
                                </a>
                            )}
                            {profile.socialLinks.twitter && (
                                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {profile.socialLinks.website && (
                                <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                        {profile.city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{profile.role || "Member"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined recently</span>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex gap-8 mt-6 pt-6 border-t border-slate-50">
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">{postCount}</span>
                            <span className="text-sm text-slate-500">Posts</span>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">0</span>
                            <span className="text-sm text-slate-500">Followers</span>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-900 text-lg">0</span>
                            <span className="text-sm text-slate-500">Following</span>
                        </div>
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

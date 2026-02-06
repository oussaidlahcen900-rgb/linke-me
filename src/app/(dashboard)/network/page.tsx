"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { UserProfile } from "@/types";
import { Check, X, User, MessageSquare, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { acceptFriendRequest, removeFriend } from "@/lib/friendUtils";

export default function NetworkPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<{ id: string, senderId: string, senderName: string, senderPhoto: string }[]>([]);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // 1. Listen for Friend Requests (where toId == user.uid)
        const qRequests = query(
            collection(db, "friendRequests"),
            where("toId", "==", user.uid),
            where("status", "==", "pending")
        );

        const unsubRequests = onSnapshot(qRequests, async (snapshot) => {
            const reqs = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                // Fetch sender profile for display
                const senderRef = doc(db, "users", data.fromId);
                const senderSnap = await getDoc(senderRef);
                const senderData = senderSnap.data();
                return {
                    id: docSnap.id, // request doc id
                    senderId: data.fromId,
                    senderName: senderData?.displayName || "Unknown User",
                    senderPhoto: senderData?.photoURL || ""
                };
            }));
            setRequests(reqs);
        });

        // 2. Listen for Friends (from user profile)
        const unsubUser = onSnapshot(doc(db, "users", user.uid), async (docSnap) => {
            const userData = docSnap.data();
            const friendIds = userData?.friends || [];

            if (friendIds.length > 0) {
                // Fetch full profiles for all friends
                // Note: In a large app, you'd paginate this or use a separate collection/index
                const friendsData = await Promise.all(friendIds.map(async (fid: string) => {
                    const fRef = doc(db, "users", fid);
                    const fSnap = await getDoc(fRef);
                    return fSnap.exists() ? fSnap.data() as UserProfile : null;
                }));
                setFriends(friendsData.filter(f => f !== null) as UserProfile[]);
            } else {
                setFriends([]);
            }
            setLoading(false);
        });

        return () => {
            unsubRequests();
            unsubUser();
        };
    }, [user]);

    const handleAccept = async (senderId: string) => {
        if (!user) return;
        try {
            await acceptFriendRequest(user.uid, senderId);
            // UI updates automatically via snapshot
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleIgnore = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, "friendRequests", requestId));
        } catch (error) {
            console.error("Error ignoring request:", error);
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!user || !confirm("Are you sure you want to remove this friend?")) return;
        try {
            await removeFriend(user.uid, friendId);
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your network...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">My Network</h1>
            </div>

            {/* Invitations Section */}
            {requests.length > 0 ? (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        Invitations <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-100 transition">
                                <Link href={`/profile?uid=${req.senderId}`} className="flex items-center gap-3">
                                    <img
                                        src={req.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.senderId}`}
                                        alt={req.senderName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{req.senderName}</div>
                                        <div className="text-xs text-slate-500">Wants to connect</div>
                                    </div>
                                </Link>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleIgnore(req.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                        title="Ignore"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAccept(req.senderId)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition border border-blue-100"
                                        title="Accept"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <User className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-600 font-medium">No pending invitations</h3>
                    <p className="text-slate-400 text-sm mt-1">When people ask to connect, they'll appear here.</p>
                </section>
            )}

            {/* Connections Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    My Connections <span className="text-slate-400 text-sm font-normal">({friends.length})</span>
                </h2>

                {friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {friends.map((friend) => (
                            <div key={friend.uid} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group relative">
                                <div className="flex flex-col items-center text-center">
                                    <Link href={`/profile?uid=${friend.uid}`}>
                                        <img
                                            src={friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.uid}`}
                                            alt={friend.displayName}
                                            className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-slate-50 group-hover:border-blue-50 transition"
                                        />
                                    </Link>
                                    <Link href={`/profile?uid=${friend.uid}`} className="font-bold text-slate-800 hover:text-blue-600 truncate w-full">
                                        {friend.displayName}
                                    </Link>
                                    <p className="text-xs text-slate-500 truncate w-full mb-4">
                                        {friend.headline || "No headline"}
                                    </p>

                                    <div className="flex gap-2 w-full">
                                        <Link
                                            href={`/chat`} // Ideally link to specific chat if possible, or just open chat list
                                            className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveFriend(friend.uid)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Remove connection"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl p-12 text-center border-dashed border-2 border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-slate-600 font-medium">No connections yet</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
                            Connect with people you know or find interesting profiles to grow your network!
                        </p>
                        <Link href="/search" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                            Find People
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}

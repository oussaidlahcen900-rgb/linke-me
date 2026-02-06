"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Clock, UserMinus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendFriendRequest, acceptFriendRequest, checkFriendship } from "@/lib/friendUtils";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FriendButtonProps {
    targetUid: string;
    className?: string;
}

export default function FriendButton({ targetUid, className = "" }: FriendButtonProps) {
    const { user } = useAuth();
    const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends' | 'loading'>('loading');

    useEffect(() => {
        if (!user || !targetUid || user.uid === targetUid) {
            setStatus('none');
            return;
        }

        // Real-time listener on Current User to check specific friend status
        const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const friends = data.friends || [];
                const requests = data.friendRequests || [];

                if (friends.includes(targetUid)) {
                    setStatus('friends');
                    return;
                }

                // Check if *I* have a request *from* them (pending_received)
                const hasRequest = requests.some((r: any) => r.uid === targetUid);
                if (hasRequest) {
                    setStatus('pending_received');
                    return;
                }

                // If not friends and no request from them, check if I sent one.
                // This requires checking the TARGET user, or storing my sent requests.
                // For simplicity/performance, let's assume 'none' locally, 
                // but checking target for 'pending_sent' is more accurate.
                // Let's do a one-off check on target for sent status to avoid double listeners if possible,
                // OR just listen to target too. Listening is safer for consistency.
                checkSentStatus();
            }
        });

        // Separate check for "Sent" status
        const checkSentStatus = async () => {
            // In a real app we might store "sentRequests" on the user to avoid reading other users' docs.
            // Here we check the target doc once.
            try {
                const targetSnap = await getDoc(doc(db, "users", targetUid));
                if (targetSnap.exists()) {
                    const data = targetSnap.data();
                    const reqs = data.friendRequests || [];
                    if (reqs.some((r: any) => r.uid === user.uid)) {
                        setStatus('pending_sent');
                    } else if (status === 'loading') {
                        setStatus('none');
                    }
                } else {
                    setStatus('none');
                }
            } catch (e) { setStatus('none'); }
        };

        return () => unsub();
    }, [user, targetUid]);

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to profile if inside a link
        e.stopPropagation();

        if (!user) return;

        if (status === 'none') {
            setStatus('pending_sent'); // Optimistic update
            await sendFriendRequest(user.uid, targetUid);
        } else if (status === 'pending_received') {
            setStatus('friends'); // Optimistic
            await acceptFriendRequest(user.uid, targetUid);
        }
        // TODO: Handle unfriend / cancel request
    };

    if (!user || user.uid === targetUid) return null;

    if (status === 'loading') {
        return <div className="p-2"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>;
    }

    if (status === 'friends') {
        return (
            <button className={`text-green-600 flex items-center gap-1 text-xs font-medium ${className}`} title="Friends">
                <UserCheck className="w-4 h-4" />
                <span>Friends</span>
            </button>
        );
    }

    if (status === 'pending_sent') {
        return (
            <button className={`text-slate-400 flex items-center gap-1 text-xs font-medium cursor-default ${className}`} title="Request Sent">
                <Clock className="w-4 h-4" />
                <span>Sent</span>
            </button>
        );
    }

    if (status === 'pending_received') {
        return (
            <button
                onClick={handleAction}
                className={`bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition ${className}`}
            >
                <UserPlus className="w-4 h-4" />
                <span>Accept</span>
            </button>
        );
    }

    // Status 'none'
    return (
        <button
            onClick={handleAction}
            className={`text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition ${className}`}
        >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
        </button>
    );
}

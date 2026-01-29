"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, UserPlus, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

// Types
interface Notification {
    id: string;
    type: 'like' | 'connect' | 'message';
    senderName: string;
    senderAvatar?: string;
    read: boolean;
    createdAt: Timestamp;
    link?: string;
    resourceSnippet?: string; // Short text of the post/message
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        // Fetch last 50 notifications
        // Note: Removed orderBy("createdAt", "desc") to avoid needing a composite index.
        // We will sort client-side.
        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.uid),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            // Client-side sort (Newest first)
            data.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setNotifications(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.read) {
            // If already read, just go to link
            if (notification.link) router.push(notification.link);
            return;
        }

        try {
            await updateDoc(doc(db, "notifications", notification.id), { read: true });
            if (notification.link) router.push(notification.link);
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllRead = async () => {
        if (!user || notifications.length === 0) return;

        const batch = writeBatch(db);
        notifications.forEach(n => {
            if (!n.read) {
                const ref = doc(db, "notifications", n.id);
                batch.update(ref, { read: true });
            }
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Batch update error:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
            case 'connect': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-green-500" />;
            default: return <Bell className="w-5 h-5 text-purple-500" />;
        }
    };

    const getMessage = (n: Notification) => {
        switch (n.type) {
            case 'like': return <>liked your post: <span className="text-slate-500 italic">"{n.resourceSnippet || '...'}"</span></>;
            case 'connect': return "started following you.";
            case 'message': return "sent you a message.";
            default: return "interacted with you.";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">Notifications</h1>
                    <p className="text-slate-500">Stay updated with your community.</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllRead}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-700">No notifications yet</h2>
                    <p className="text-slate-400">When people interact with you, they'll show up here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n)}
                            className={`
                                group relative p-4 rounded-2xl flex items-start gap-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                                ${n.read ? 'bg-white/60 hover:bg-white border border-transparent' : 'bg-white border-l-4 border-l-blue-500 shadow-sm'}
                            `}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <img
                                    src={n.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.senderName}`}
                                    alt={n.senderName}
                                    className="w-12 h-12 rounded-full object-cover border border-slate-100"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                                    {getIcon(n.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-900 font-semibold text-base">
                                        {n.senderName}
                                        <span className="font-normal text-slate-600 ml-1">{getMessage(n)}</span>
                                    </p>
                                    {!n.read && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

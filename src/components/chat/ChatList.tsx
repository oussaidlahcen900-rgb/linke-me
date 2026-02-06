"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Conversation } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
    onSelect: (conv: Conversation) => void;
    selectedId?: string;
}

import { BOT_ID, getUserProfile } from "@/lib/chatUtils";

export default function ChatList({ onSelect, selectedId }: ChatListProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!user) return;

        // Query conversations where current user is a participant
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convsPromises = snapshot.docs.map(async (doc) => {
                const data = doc.data() as Omit<Conversation, "id">;
                const otherUid = data.participants.find(p => p !== user.uid);

                let otherUser = { displayName: "Unknown User", photoURL: "", uid: otherUid || "" };

                if (otherUid) {
                    // Fetch real profile
                    try {
                        const profile = await getUserProfile(otherUid);
                        if (profile) {
                            otherUser = {
                                displayName: profile.displayName || "Unknown User",
                                photoURL: profile.photoURL || "",
                                uid: otherUid
                            };
                        }
                    } catch (error) {
                        console.error("Error fetching profile:", error);
                    }
                }

                return {
                    id: doc.id,
                    ...data,
                    otherUser
                };
            });

            const convs = await Promise.all(convsPromises);
            setConversations(convs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredConvs = conversations.filter(c =>
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
        // || c.otherUser?.displayName...
    );

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredConvs.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-10">No messages found.</div>
                ) : (
                    filteredConvs.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv)}
                            className={`
                                p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3
                                ${selectedId === conv.id
                                    ? 'bg-blue-50/80 border-blue-100 shadow-sm'
                                    : 'hover:bg-slate-50 border border-transparent'}
                            `}
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex flex-shrink-0 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participants.find(p => p !== user?.uid)}`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {conv.unreadCount?.[user?.uid || ''] > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`text-sm font-semibold truncate ${selectedId === conv.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                        User {conv.participants.find(p => p !== user?.uid)?.slice(0, 4)}...
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {conv.lastMessageAt?.toDate ? formatDistanceToNow(conv.lastMessageAt.toDate(), { addSuffix: false }) : ''}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${conv.unreadCount?.[user?.uid || ''] > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                    {conv.lastMessage || "Started a conversation"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

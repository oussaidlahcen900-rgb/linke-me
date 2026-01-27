"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, setDoc } from "firebase/firestore";
import { Conversation, Message } from "@/types";
import { Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";

interface ChatWindowProps {
    conversation: Conversation;
    onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const otherUid = conversation.participants.find(p => p !== user?.uid);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!conversation.id) return;

        const q = query(
            collection(db, "conversations", conversation.id, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
            // Mark as read could go here
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [conversation.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const text = newMessage.trim();
        setNewMessage("");

        const convoRef = doc(db, "conversations", conversation.id);
        const messagesRef = collection(convoRef, "messages");

        await addDoc(messagesRef, {
            text,
            senderId: user.uid,
            createdAt: serverTimestamp(),
            read: false
        });

        // Update conversation summary
        await updateDoc(convoRef, {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
            // unreadCount logic would ideally be atomic increment for the OTHER user
            [`unreadCount.${otherUid}`]: (conversation.unreadCount?.[otherUid || ''] || 0) + 1
        });
    };

    return (
        <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUid}`}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                            {/* Online Indicator (Mock) */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm">User {otherUid?.slice(0, 4)}</h2>
                            <p className="text-xs text-green-600 font-medium">Online</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 text-slate-400">
                    <button className="p-2 hover:bg-slate-50 rounded-full transition"><Phone className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-50 rounded-full transition"><Video className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-50 rounded-full transition"><MoreVertical className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.uid;
                    const isLast = idx === messages.length - 1;

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`
                                max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group
                                ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}
                            `}>
                                {msg.text}
                                <span className={`
                                    text-[10px] block text-right mt-1 opacity-70
                                    ${isMe ? 'text-blue-100' : 'text-slate-400'}
                                `}>
                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-slate-700 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full disabled:opacity-50 disabled:scale-90 transition-all shadow-md"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </>
    );
}

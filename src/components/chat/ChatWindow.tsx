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

import { uploadFile } from "@/lib/storageUtils";
import { setTypingStatus } from "@/lib/chatUtils";
import { Image as ImageIcon } from "lucide-react";

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [otherIsTyping, setOtherIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const otherUid = conversation.participants.find(p => p !== user?.uid);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!conversation.id || !otherUid) return;

        // 1. Listen for Messages
        const q = query(
            collection(db, "conversations", conversation.id, "messages"),
            orderBy("createdAt", "asc")
        );
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
            setTimeout(scrollToBottom, 50);
        });

        // 2. Listen for Typing Status (on the main conversation doc)
        const convoRef = doc(db, "conversations", conversation.id);
        const unsubscribeConvo = onSnapshot(convoRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.typing && data.typing[otherUid]) {
                const typingInfo = data.typing[otherUid];
                const isTypingNow = typingInfo.isTyping;
                // Optional: Check lastTyped timestamp to timeout stuck status
                setOtherIsTyping(isTypingNow);
            } else {
                setOtherIsTyping(false);
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeConvo();
        };
    }, [conversation.id, otherUid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!conversation.id || !user) return;

        // Debounce typing status
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        setTypingStatus(conversation.id, user.uid, true);

        typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(conversation.id, user.uid, false);
        }, 2000);
    };

    const handleSend = async (e?: React.FormEvent, imageUrl?: string) => {
        if (e) e.preventDefault();

        const text = newMessage.trim();
        if ((!text && !imageUrl) || !user) return;

        setNewMessage("");
        setTypingStatus(conversation.id, user.uid, false); // Stop typing immediately

        const convoRef = doc(db, "conversations", conversation.id);
        const messagesRef = collection(convoRef, "messages");

        await addDoc(messagesRef, {
            text: text || (imageUrl ? "Sent an image" : ""),
            imageUrl: imageUrl || null,
            senderId: user.uid,
            createdAt: serverTimestamp(),
            read: false
        });

        await updateDoc(convoRef, {
            lastMessage: imageUrl ? "📷 Image" : text,
            lastMessageAt: serverTimestamp(),
            [`unreadCount.${otherUid}`]: (conversation.unreadCount?.[otherUid || ''] || 0) + 1
        });
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const path = `chat-images/${conversation.id}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            await handleSend(undefined, url);
        } catch (error) {
            console.error("Failed to upload image", error);
        } finally {
            setIsUploading(false);
        }
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
                                {msg.imageUrl && (
                                    <img
                                        src={msg.imageUrl}
                                        alt="Sent image"
                                        className="rounded-lg mb-2 max-w-full max-h-60 object-cover border border-white/20"
                                    />
                                )}
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
                {otherIsTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full rounded-tl-none">
                            User is typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-2 py-2 text-sm outline-none text-slate-700 placeholder:text-slate-400"
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

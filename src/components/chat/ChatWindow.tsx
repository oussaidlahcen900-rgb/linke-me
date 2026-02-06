"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Conversation, Message } from "@/types";
import { Send, ArrowLeft, MoreVertical, Phone, Video, Trash2, Edit2, X, Image as ImageIcon } from "lucide-react";

interface ChatWindowProps {
    conversation: Conversation;
    onBack?: () => void;
}

import { uploadFile } from "@/lib/storageUtils";
import { setTypingStatus } from "@/lib/chatUtils";
import { BOT_ID, getUserProfile, getBotReply } from "@/lib/chatUtils";

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [otherIsTyping, setOtherIsTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Edit/Delete State
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const otherUid = conversation.participants.find(p => p !== user?.uid);

    // Bot Auto-Reply Logic ... (unchanged)
    useEffect(() => {
        if (!otherUid || otherUid !== BOT_ID || messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.senderId === user?.uid && !editingMessageId) { // Don't reply if user is just editing
            // ... existing bot logic
            // (Simplified for brevity in this replace, ensuring we don't duplicate logic if not needed to change)
            // Keeping the original logic structure but adding the check.
            setOtherIsTyping(true);
            const timer = setTimeout(async () => {
                const reply = getBotReply(lastMsg.text);

                const convoRef = doc(db, "conversations", conversation.id);
                const messagesRef = collection(convoRef, "messages");
                await addDoc(messagesRef, {
                    text: reply, senderId: BOT_ID, createdAt: serverTimestamp(), read: false
                });
                await updateDoc(convoRef, {
                    lastMessage: reply, lastMessageAt: serverTimestamp(),
                    [`unreadCount.${user?.uid}`]: (conversation.unreadCount?.[user?.uid || ''] || 0) + 1
                });
                setOtherIsTyping(false);
            }, 1000 + Math.random() * 1000); // Natural delay
            return () => clearTimeout(timer);
        }
    }, [messages, otherUid, conversation.id, user, conversation.unreadCount, editingMessageId]);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!conversation.id || !otherUid) return;
        const q = query(
            collection(db, "conversations", conversation.id, "messages"),
            orderBy("createdAt", "asc")
        );
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
            setMessages(msgs);
            // Only auto-scroll if we are near bottom or it's initial load
            // For simplicity, scrolling on every new message
            setTimeout(scrollToBottom, 50);
        });

        // Listen for Typing Status (unchanged)
        const convoRef = doc(db, "conversations", conversation.id);
        const unsubscribeConvo = onSnapshot(convoRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.typing && data.typing[otherUid]) {
                setOtherIsTyping(data.typing[otherUid].isTyping);
            } else {
                setOtherIsTyping(false);
            }
        });

        return () => { unsubscribeMessages(); unsubscribeConvo(); };
    }, [conversation.id, otherUid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!conversation.id || !user) return;
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
        setTypingStatus(conversation.id, user.uid, false);
        setEditingMessageId(null); // Clear edit mode if it was active (though usually cancelled)

        const convoRef = doc(db, "conversations", conversation.id);

        if (editingMessageId) {
            // Update existing message
            const msgRef = doc(db, "conversations", conversation.id, "messages", editingMessageId);
            await updateDoc(msgRef, {
                text: text
            });
            // Optional: Update lastMessage of conversation if this was the last one?
            // Complex to sync, usually fine to leave lastMessage/preview as is or update it.
            // Let's perform a simple check:
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.id === editingMessageId) {
                await updateDoc(convoRef, { lastMessage: text });
            }
        } else {
            // Send new message
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
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (unchanged)
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setIsUploading(true);
        try {
            const path = `chat-images/${conversation.id}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            await handleSend(undefined, url);
        } catch (error) { console.error(error); } finally { setIsUploading(false); }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!confirm("Delete this message?")) return;
        try {
            await deleteDoc(doc(db, "conversations", conversation.id, "messages", msgId));
            setOpenMessageMenuId(null);
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    const handleEditClick = (msg: Message) => {
        setEditingMessageId(msg.id);
        setNewMessage(msg.text);
        setOpenMessageMenuId(null);
        inputRef.current?.focus();
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setNewMessage("");
    };

    const [otherUserProfile, setOtherUserProfile] = useState<{ displayName: string, photoURL: string } | null>(null);

    useEffect(() => {
        if (otherUid) {
            getUserProfile(otherUid).then(profile => {
                if (profile) setOtherUserProfile({ displayName: profile.displayName || "Unknown", photoURL: profile.photoURL || "" });
            });
        }
    }, [otherUid]);

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
                                src={otherUserProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUid}`}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm">
                                {otherUserProfile?.displayName || (otherUid === BOT_ID ? "Linke-Me Bot 🦊" : "Loading...")}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-50 rounded-full transition text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <a href={`/profile?uid=${otherUid}`} className="block w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">View Profile</a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.uid;
                    const isMenuOpen = openMessageMenuId === msg.id;

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative animate-in slide-in-from-bottom-2 duration-300`}>
                            {/* Message Actions Menu (Left side for ME, Right side for OTHER) */}
                            {isMe && (
                                <div className="relative self-center mr-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setOpenMessageMenuId(isMenuOpen ? null : msg.id)}
                                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400"
                                    >
                                        <MoreVertical className="w-3 h-3" />
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setOpenMessageMenuId(null)}></div>
                                            <div className="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-20 py-1 overflow-hidden">
                                                <button onClick={() => handleEditClick(msg)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button onClick={() => handleDeleteMessage(msg.id)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className={`
                                max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative
                                ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}
                            `}>
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="Sent image" className="rounded-lg mb-2 max-w-full max-h-60 object-cover border border-white/20" />
                                )}
                                {msg.text}
                                <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {otherIsTyping && (
                    <div className="flex justify-start animate-pulse"><div className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full rounded-tl-none">User is typing...</div></div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                {editingMessageId && (
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-2 text-xs text-blue-700 mb-2 rounded-lg border border-blue-100">
                        <span>Editing message...</span>
                        <button onClick={cancelEdit} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                    </div>
                )}
                <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || !!editingMessageId} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-50">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
                        className="flex-1 bg-transparent px-2 py-2 text-sm outline-none text-slate-700 placeholder:text-slate-400"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className={`bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full disabled:opacity-50 disabled:scale-90 transition-all shadow-md ${editingMessageId ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                        {editingMessageId ? <Edit2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </>
    );
}



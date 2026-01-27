"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { Conversation } from "@/types";
import { MessageSquare, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function ChatContent() {
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("id");

    // ... existing logic ...

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-select based on URL
    useEffect(() => {
        const fetchConv = async () => {
            if (conversationId && !selectedConversation) {
                setLoading(true);
                try {
                    const docRef = doc(db, "conversations", conversationId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSelectedConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
                        setIsMobileChatOpen(true);
                    }
                } catch (err) {
                    console.error("Error fetching conversation:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchConv();
    }, [conversationId]); // Only run when ID changes

    return (
        <div className="h-[calc(100vh-5rem)] flex gap-6 p-4 md:p-6 overflow-hidden max-w-7xl mx-auto">

            {/* Left Side - Chat List */}
            <div className={`
                flex-1 md:flex-none md:w-80 lg:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm
                flex flex-col overflow-hidden transition-all duration-300
                ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Messages
                    </h1>
                </div>

                <ChatList
                    onSelect={(conv) => {
                        setSelectedConversation(conv);
                        setIsMobileChatOpen(true);
                    }}
                    selectedId={selectedConversation?.id || conversationId || undefined}
                />
            </div>

            {/* Right Side - Chat Window */}
            <div className={`
                flex-[2] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm
                flex flex-col overflow-hidden relative
                ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}
            `}>
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={() => setIsMobileChatOpen(false)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 animate-bounce-subtle">
                            <MessageSquare className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600">Select a conversation</h3>
                        <p className="text-sm">Choose a contact to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>}>
            <ChatContent />
        </Suspense>
    );
}

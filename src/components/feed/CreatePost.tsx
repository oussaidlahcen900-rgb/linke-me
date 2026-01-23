"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreatePost() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            // TODO: Replace with real user data when Auth is connected to context
            const mockUser = {
                uid: "user_123",
                name: "Guest User",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
            };

            await addDoc(collection(db, "posts"), {
                text,
                authorId: mockUser.uid,
                authorName: mockUser.name,
                authorAvatar: mockUser.avatar,
                likes: 0,
                createdAt: serverTimestamp(),
            });

            setText("");
        } catch (error) {
            console.error("Error adding post: ", error);
            alert("Failed to post. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
                        alt="User"
                        className="w-10 h-10 rounded-full bg-slate-100"
                    />
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What's happening in your city?"
                            className="w-full resize-none border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-lg min-h-[80px]"
                        />

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                            <button
                                type="button"
                                className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            <button
                                type="submit"
                                disabled={!text.trim() || loading}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

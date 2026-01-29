"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Send, Loader2, User } from "lucide-react";
import Link from "next/link";
import Linkify from "@/components/ui/Linkify";
import { formatRelativeTime } from "@/lib/dateUtils";

interface Comment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    createdAt: any;
}

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newItem, setNewItem] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "comments"),
            where("postId", "==", postId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Comment));
            setComments(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim() || !user) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "comments"), {
                postId,
                text: newItem.trim(),
                authorId: user.uid,
                authorName: user.displayName || "User",
                authorAvatar: user.photoURL,
                createdAt: serverTimestamp()
            });
            setNewItem("");
        } catch (error) {
            console.error("Error commenting:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pt-4 border-t border-slate-50 mt-4 animate-in slide-in-from-top-2 duration-300">
            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-2">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Link href={`/profile?uid=${comment.authorId}`} className="shrink-0">
                                <img
                                    src={comment.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`}
                                    alt={comment.authorName}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-100"
                                />
                            </Link>
                            <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 transition-colors hover:bg-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <Link href={`/profile?uid=${comment.authorId}`} className="text-xs font-bold text-slate-900 hover:underline">
                                        {comment.authorName}
                                    </Link>
                                    <span className="text-[10px] text-slate-400">
                                        {formatRelativeTime(comment.createdAt)}
                                    </span>
                                </div>
                                <Linkify text={comment.text} className="text-sm text-slate-700 leading-relaxed break-words block" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-start">
                <img
                    src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                    alt="Current user"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newItem.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </button>
                </div>
            </form>
        </div>
    );
}

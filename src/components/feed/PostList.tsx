"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Post } from "@/types";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { where } from "firebase/firestore"; // Add import

export default function PostList({ userId }: { userId?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

        if (userId) {
            q = query(collection(db, "posts"), where("authorId", "==", userId), orderBy("createdAt", "desc"));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];
            setPosts(newPosts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-48 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.authorAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                                alt={post.authorName}
                                className="w-10 h-10 rounded-full bg-slate-100"
                            />
                            <div>
                                <h3 className="font-semibold text-slate-900">{post.authorName}</h3>
                                <p className="text-xs text-slate-500">
                                    {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                                </p>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-slate-800 mb-4 whitespace-pre-wrap">{post.text}</p>

                    {post.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-slate-500">
                        <button className="flex items-center gap-2 hover:text-red-500 transition group">
                            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-500 transition">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Comment</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-500 transition">
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Share</span>
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}

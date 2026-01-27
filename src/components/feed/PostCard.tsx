"use client";

import { Share2, MoreHorizontal, MessageSquare, Heart, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from "firebase/firestore";
import clsx from "clsx";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import CommentSection from "./CommentSection";

interface PostProps {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorRole?: string;
    authorCity?: string;
    text: string;
    imageUrl?: string;
    likes: number;
    createdAt: any;
    likedBy?: string[];
}

export default function PostCard({ post }: { post: PostProps }) {
    const [showComments, setShowComments] = useState(false);
    const { user } = useAuth();
    const [hasLiked, setHasLiked] = useState(post.likedBy?.includes(user?.uid || "") || false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = async () => {
        if (!user) return;
        const postRef = doc(db, "posts", post.id);

        try {
            if (hasLiked) {
                await updateDoc(postRef, {
                    likes: Math.max(0, post.likes - 1),
                    likedBy: arrayRemove(user.uid)
                });
                setHasLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                await updateDoc(postRef, {
                    likes: post.likes + 1,
                    likedBy: arrayUnion(user.uid)
                });
                setHasLiked(true);
                setLikeCount(prev => prev + 1);

                // Trigger Notification (only if not self-like)
                if (post.authorId !== user.uid) {
                    await addDoc(collection(db, "notifications"), {
                        recipientId: post.authorId,
                        senderId: user.uid,
                        senderName: user.displayName || "Someone",
                        senderAvatar: user.photoURL,
                        type: "like",
                        read: false,
                        createdAt: serverTimestamp(),
                        link: "/feed",
                        resourceSnippet: post.text.substring(0, 30) + (post.text.length > 30 ? "..." : "")
                    });
                }
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    return (
        <div className="card mb-4 transition-all duration-300 hover:shadow-md">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                    <Link href={`/profile?uid=${post.authorId}`}>
                        <img
                            src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
                            alt={post.authorName}
                            className="w-12 h-12 rounded-full object-cover border border-slate-100"
                        />
                    </Link>
                    <div>
                        <Link href={`/profile?uid=${post.authorId}`} className="font-semibold text-slate-900 hover:underline">
                            {post.authorName}
                        </Link>
                        {post.authorRole && <p className="text-xs text-slate-500">{post.authorRole}</p>}
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>Just now</span> {/* Placeholder timestamp */}
                            {post.authorCity && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-0.5 text-blue-500">
                                        <MapPin className="w-3 h-3" />
                                        {post.authorCity}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-slate-700 whitespace-pre-line">{post.text}</p>
                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="mt-4 rounded-lg w-full object-cover max-h-[400px] border border-slate-100"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition group ${hasLiked ? "text-red-500" : "text-slate-500 hover:text-red-500"}`}
                >
                    <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : "group-hover:fill-current"}`} />
                    <span className="text-sm">{likeCount}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 transition ${showComments ? "text-blue-600" : "text-slate-500 hover:text-blue-600"}`}
                >
                    <MessageSquare className={`w-5 h-5 ${showComments ? "fill-current" : ""}`} />
                    {/* <span className="text-sm">Comments</span> */}
                </button>

                <button className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
}

"use client";

import { Share2, MoreHorizontal, MessageSquare, Heart, MapPin, Flag } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from "firebase/firestore";
import clsx from "clsx";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import CommentSection from "./CommentSection";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import Linkify from "@/components/ui/Linkify";
import { formatRelativeTime } from "@/lib/dateUtils";
import FriendButton from "@/components/social/FriendButton";
import { submitReport } from "@/lib/reportUtils";

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
    authorVerified?: boolean;
}

export default function PostCard({ post }: { post: PostProps }) {
    const [showComments, setShowComments] = useState(false);
    const { user } = useAuth();
    const [hasLiked, setHasLiked] = useState(post.likedBy?.includes(user?.uid || "") || false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [showMenu, setShowMenu] = useState(false);

    const handleLike = async () => {
        if (!user) return;

        const postRef = doc(db, "posts", post.id);
        try {
            if (hasLiked) {
                await updateDoc(postRef, {
                    likes: Math.max(0, likeCount - 1),
                    likedBy: arrayRemove(user.uid)
                });
                setLikeCount(prev => Math.max(0, prev - 1));
                setHasLiked(false);
            } else {
                await updateDoc(postRef, {
                    likes: likeCount + 1,
                    likedBy: arrayUnion(user.uid)
                });
                setLikeCount(prev => prev + 1);
                setHasLiked(true);
            }
        } catch (error) {
            console.error("Error updating like:", error);
            // Revert optimistic update
            setHasLiked(!hasLiked);
            setLikeCount(post.likes);
        }
    };

    const handleReport = async () => {
        if (!user) return;
        if (confirm("Report this post for inappropriate content?")) {
            const success = await submitReport(post.id, user.uid);
            if (success) alert("Post reported. Thank you for helping keep the community safe.");
            setShowMenu(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${post.authorName}`,
                    text: post.text,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop/unsupported browsers
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="card mb-4 transition-all duration-300 hover:shadow-md relative">
            <div className="absolute top-4 right-4">
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleReport}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition font-medium flex items-center gap-2"
                            >
                                <Flag className="w-4 h-4" /> Report Post
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-start justify-between mb-4">
                {/* ... rest of header ... */}
                <div className="flex gap-3">
                    <Link href={`/profile?uid=${post.authorId}`}>
                        <img
                            src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
                            alt={post.authorName}
                            className="w-12 h-12 rounded-full object-cover border border-slate-100"
                        />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <Link href={`/profile?uid=${post.authorId}`} className="font-semibold text-slate-900 hover:underline flex items-center gap-1">
                                {post.authorName}
                                {post.authorVerified && <VerificationBadge size={14} />}
                            </Link>
                            <FriendButton targetUid={post.authorId} />
                        </div>
                        {post.authorRole && <p className="text-xs text-slate-500">{post.authorRole}</p>}
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>{formatRelativeTime(post.createdAt)}</span>
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
                <Linkify text={post.text} className="text-slate-700 whitespace-pre-line block" />
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

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
}

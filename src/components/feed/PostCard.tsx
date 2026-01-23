"use client";

import { Heart, MessageSquare, Share2, MoreHorizontal, MapPin } from "lucide-react";
import clsx from "clsx";

interface PostProps {
    author: {
        name: string;
        avatar: string;
        role: string;
        city: string; // Critical for local context
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
}

export default function PostCard({ post }: { post: PostProps }) {
    return (
        <div className="card mb-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                        <h3 className="font-semibold text-slate-900">{post.author.name}</h3>
                        <p className="text-xs text-slate-500">{post.author.role}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <div className="flex items-center gap-0.5 text-blue-500">
                                <MapPin className="w-3 h-3" />
                                {post.author.city}
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-slate-700 whitespace-pre-line">{post.content}</p>
                {post.image && (
                    <img
                        src={post.image}
                        alt="Post content"
                        className="mt-4 rounded-lg w-full object-cover max-h-[400px] border border-slate-100"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition group">
                    <Heart className="w-5 h-5 group-hover:fill-current" />
                    <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                </button>
            </div>
        </div>
    );
}

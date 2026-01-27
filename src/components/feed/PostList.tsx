"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Post } from "@/types";


import PostCard from "./PostCard";
import { where } from "firebase/firestore";

export default function PostList({ userId }: { userId?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

        if (userId) {
            // Remove orderBy to avoid "Missing Index" error on dev environments
            // We will sort client-side instead
            q = query(collection(db, "posts"), where("authorId", "==", userId));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];

            // Client-side sort to ensure order (especially for the filtered list)
            // Assuming createdAt is a Firestore Timestamp
            newPosts.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

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
                <PostCard
                    key={post.id}
                    post={{
                        id: post.id,
                        authorId: post.authorId,
                        authorName: post.authorName,
                        authorAvatar: post.authorAvatar,
                        authorRole: "Member", // Placeholder as Post type doesn't have role yet
                        authorCity: "Casablanca", // Placeholder
                        text: post.text,
                        imageUrl: post.imageUrl,
                        likes: post.likes,
                        createdAt: post.createdAt,
                        likedBy: [] // We might need to fetch this or add to Post type
                    }}
                />
            ))}
        </div>
    );
}

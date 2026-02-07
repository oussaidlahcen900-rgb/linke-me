"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Post } from "@/types";


import PostCard from "./PostCard";
import { where } from "firebase/firestore";

import { useLanguage } from "@/context/LanguageContext";

export default function PostList({ userId }: { userId?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        // ... (rest of effect logic is same, only importing useLanguage above)
        if (userId) {
            q = query(collection(db, "posts"), where("authorId", "==", userId));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];

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

    if (!loading && posts.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">{t('noPosts')}</p>
                <p className="text-slate-400 text-sm mt-1">{t('beFirst')}</p>
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
                        authorRole: "Member",
                        authorCity: "Casablanca",
                        text: post.text,
                        imageUrl: post.imageUrl,
                        likes: post.likes,
                        createdAt: post.createdAt,
                        likedBy: []
                    }}
                />
            ))}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PostCard from "@/components/feed/PostCard";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SinglePostPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postId = params?.id as string;
                if (!postId) return;

                const docRef = doc(db, "posts", postId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params?.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Post not found</h1>
                <p className="text-slate-500 mb-6">The post you are looking for does not exist or has been removed.</p>
                <Link href="/feed" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <PostCard post={post} />
        </div>
    );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { User, Briefcase, FileText, Loader2 } from "lucide-react";
import { UserProfile, Job, Post } from "@/types";

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q")?.toLowerCase() || "";

    const [activeTab, setActiveTab] = useState<'all' | 'people' | 'jobs' | 'posts'>('all');
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (!q) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // VERY BASIC SEARCH IMPLEMENTATION
                // Firestore doesn't support full text search natively.
                // We will fetch recent items and filter client side OR use startAt/endAt for prefix match if feasible.
                // For this demo, let's fetch a batch and filter client-side for "contains" logic which is better UX for small datasets.

                // 1. Users
                const usersRef = collection(db, "users");
                const usersSnap = await getDocs(query(usersRef, limit(50))); // Fetch last 50 users
                const foundUsers = usersSnap.docs
                    .map(d => d.data() as UserProfile)
                    .filter(u => u.displayName?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
                setUsers(foundUsers);

                // 2. Jobs
                const jobsRef = collection(db, "jobs");
                const jobsSnap = await getDocs(query(jobsRef, orderBy("createdAt", "desc"), limit(50)));
                const foundJobs = jobsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() } as Job))
                    .filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
                setJobs(foundJobs);

                // 3. Posts
                const postsRef = collection(db, "posts");
                const postsSnap = await getDocs(query(postsRef, orderBy("createdAt", "desc"), limit(50)));
                const foundPosts = postsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() } as Post))
                    .filter(p => p.text.toLowerCase().includes(q));
                setPosts(foundPosts);

            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, 500);
        return () => clearTimeout(debounce);
    }, [q]);

    if (!q) return <div className="text-center p-10 text-slate-500">Type something to search...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Results for "{searchParams.get("q")}"</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'people', label: 'People' },
                    { id: 'jobs', label: 'Jobs' },
                    { id: 'posts', label: 'Posts' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 px-2 text-sm font-medium transition relative ${activeTab === tab.id
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* PEOPLE */}
                    {(activeTab === 'all' || activeTab === 'people') && users.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> People</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {users.map(user => (
                                    <div key={user.uid} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                        <img
                                            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                                            alt={user.displayName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{user.displayName}</h3>
                                            <p className="text-sm text-slate-500">{user.role || "Member"}</p>
                                        </div>
                                        <Link href={`/profile?uid=${user.uid}`} className="ml-auto text-sm text-blue-600 font-medium hover:underline">
                                            View
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* JOBS */}
                    {(activeTab === 'all' || activeTab === 'jobs') && jobs.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Jobs</h2>
                            <div className="space-y-3">
                                {jobs.map(job => (
                                    <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                                        <p className="text-sm text-slate-500">{job.company} • {job.location}</p>
                                        <Link href={`/jobs`} className="text-sm text-blue-600 mt-2 block hover:underline">View details</Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* POSTS */}
                    {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Posts</h2>
                            <div className="space-y-3">
                                {posts.map(post => (
                                    <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-sm">{post.authorName}</span>
                                            <span className="text-xs text-slate-400">• Posted recently</span>
                                        </div>
                                        <p className="text-slate-700 line-clamp-2">{post.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {users.length === 0 && jobs.length === 0 && posts.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            No results found for "{q}".
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>}>
            <SearchResults />
        </Suspense>
    );
}

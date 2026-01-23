"use client";

import { useState, useEffect } from "react";
import JobCard from "@/components/jobs/JobCard";
import PostJobForm from "@/components/jobs/PostJobForm";
import { Search, MapPin, Filter, Plus, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [filterCity, setFilterCity] = useState("New York, NY");
    const [showPostForm, setShowPostForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for jobs
        const q = query(collection(db, "jobs"), orderBy("postedAtTimestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Simple client-side formatting override if needed, 
                // mostly relying on what we stored or a helper
                postedAt: doc.data().postedAt || "Just now"
            }));
            setJobs(jobsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter Logic
    const filteredJobs = jobs.filter(job =>
        job.location?.toLowerCase().includes(filterCity.toLowerCase()) || filterCity === ""
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Local Opportunities</h1>
                    <p className="text-slate-500 mt-2">Find the best jobs in your area.</p>
                </div>

                {user && (
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-md transition"
                    >
                        {showPostForm ? "Cancel" : <><Plus className="w-5 h-5" /> Post a Job</>}
                    </button>
                )}
            </div>

            {showPostForm && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <PostJobForm onSuccess={() => setShowPostForm(false)} />
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search job titles or companies..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
                <div className="md:w-1/3 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        placeholder="City, State"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            <div className="space-y-4">
                <h2 className="font-semibold text-slate-700 mb-4">
                    Showing {filteredJobs.length} jobs in <span className="text-blue-600">{filterCity || "All Locations"}</span>
                </h2>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No jobs found in this location.</p>
                        <button
                            onClick={() => setFilterCity("")}
                            className="mt-2 text-blue-600 font-medium hover:underline"
                        >
                            View all locations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

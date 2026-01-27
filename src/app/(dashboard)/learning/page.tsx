"use client";

import { useState, useEffect } from "react";
import CourseCard from "@/components/learning/CourseCard";
import PostCourseForm from "@/components/learning/PostCourseForm";
import { Search, MapPin, Plus, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types";

export default function LearningPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filterCity, setFilterCity] = useState("New York, NY");
    const [showPostForm, setShowPostForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(data as Course[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.location?.toLowerCase().includes(filterCity.toLowerCase()) || filterCity === ""
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 text-gradient bg-clip-text text-transparent">Learning Center</h1>
                    <p className="text-slate-500 mt-2">Find courses, workshops, and local training.</p>
                </div>

                {user && (
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-md transition"
                    >
                        {showPostForm ? "Cancel" : <><Plus className="w-5 h-5" /> Add Course</>}
                    </button>
                )}
            </div>

            {showPostForm && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <PostCourseForm onSuccess={() => setShowPostForm(false)} />
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search topics..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none" />
                </div>
                <div className="md:w-1/3 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="City" className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none" />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> :
                    filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No courses found here.</p>
                            <button onClick={() => setFilterCity("")} className="mt-2 text-blue-600 font-medium hover:underline">View all</button>
                        </div>
                    )}
            </div>
        </div>
    );
}

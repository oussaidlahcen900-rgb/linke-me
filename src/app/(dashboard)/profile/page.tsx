"use client";

import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostList from "@/components/feed/PostList";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc, getCountFromServer } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { UserProfile, Job, Service } from "@/types";
import { Loader2, Grid, Briefcase, Wrench, User, Linkedin, Github, Twitter, Globe } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import ServiceCard from "@/components/services/ServiceCard";

function ProfileContent() {
    const { user, profile: myProfile, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const targetUid = searchParams.get("uid");

    const [displayedProfile, setDisplayedProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [postCount, setPostCount] = useState(0);

    // Tab State
    const [activeTab, setActiveTab] = useState<"posts" | "jobs" | "services" | "about">("posts");

    // Data State for Tabs
    const [jobs, setJobs] = useState<Job[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Determine whose profile to show
    useEffect(() => {
        if (authLoading) return;

        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                if (!targetUid || (user && targetUid === user.uid)) {
                    setDisplayedProfile(myProfile);
                } else if (targetUid) {
                    const userDoc = await getDoc(doc(db, "users", targetUid));
                    if (userDoc.exists()) {
                        setDisplayedProfile(userDoc.data() as UserProfile);
                    } else {
                        setDisplayedProfile(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [user, myProfile, targetUid, authLoading]);

    // Fetch Stats & Data when profile loads or tab changes
    useEffect(() => {
        if (!displayedProfile?.uid) return;

        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Always fetch post count
                const postsQ = query(collection(db, "posts"), where("authorId", "==", displayedProfile.uid));
                const postSnapshot = await getCountFromServer(postsQ);
                setPostCount(postSnapshot.data().count);

                // Fetch Tab Specific Data
                if (activeTab === "jobs") {
                    const jobsQ = query(collection(db, "jobs"), where("authorId", "==", displayedProfile.uid), orderBy("postedAt", "desc"));
                    const jobsSnap = await getDocs(jobsQ);
                    setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
                } else if (activeTab === "services") {
                    const servicesQ = query(collection(db, "services"), where("authorId", "==", displayedProfile.uid), orderBy("postedAt", "desc"));
                    const servicesSnap = await getDocs(servicesQ);
                    setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
                }
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [displayedProfile, activeTab]);

    if (authLoading || loadingProfile) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (!displayedProfile) {
        return (
            <div className="p-20 text-center text-slate-500">
                <h2 className="text-xl font-bold text-slate-800 mb-2">User not found</h2>
                <p>The profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <ProfileHeader profile={displayedProfile} postCount={postCount} />

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition whitespace-nowrap border-b-2 ${activeTab === "posts" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Grid className="w-4 h-4" /> Posts
                </button>
                <button
                    onClick={() => setActiveTab("jobs")}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition whitespace-nowrap border-b-2 ${activeTab === "jobs" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Briefcase className="w-4 h-4" /> Jobs
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition whitespace-nowrap border-b-2 ${activeTab === "services" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Wrench className="w-4 h-4" /> Services
                </button>
                <button
                    onClick={() => setActiveTab("about")}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition whitespace-nowrap border-b-2 ${activeTab === "about" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <User className="w-4 h-4" /> About
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === "posts" && (
                    <PostList userId={displayedProfile.uid} />
                )}

                {activeTab === "jobs" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {loadingData ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : jobs.length > 0 ? (
                            jobs.map(job => <JobCard key={job.id} job={job} />)
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No jobs posted yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        {loadingData ? (
                            <div className="col-span-2 flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : services.length > 0 ? (
                            services.map(service => <ServiceCard key={service.id} service={service} />)
                        ) : (
                            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No services offered yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in duration-300 max-w-2xl">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">About</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {displayedProfile.bio || "This user hasn't written a bio yet."}
                        </p>

                        {/* Social Links */}
                        {displayedProfile.socialLinks && Object.values(displayedProfile.socialLinks).some(link => link) && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="font-semibold text-slate-900 mb-3">Connect</h4>
                                <div className="flex flex-wrap gap-4">
                                    {displayedProfile.socialLinks.linkedin && (
                                        <a href={displayedProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
                                            <Linkedin className="w-5 h-5" />
                                            <span className="text-sm font-medium">LinkedIn</span>
                                        </a>
                                    )}
                                    {displayedProfile.socialLinks.github && (
                                        <a href={displayedProfile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
                                            <Github className="w-5 h-5" />
                                            <span className="text-sm font-medium">GitHub</span>
                                        </a>
                                    )}
                                    {displayedProfile.socialLinks.twitter && (
                                        <a href={displayedProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-sky-500 transition">
                                            <Twitter className="w-5 h-5" />
                                            <span className="text-sm font-medium">Twitter</span>
                                        </a>
                                    )}
                                    {displayedProfile.socialLinks.website && (
                                        <a href={displayedProfile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition">
                                            <Globe className="w-5 h-5" />
                                            <span className="text-sm font-medium">Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="font-semibold text-slate-900 mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {displayedProfile.skills && displayedProfile.skills.length > 0 ? (
                                    displayedProfile.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-500 text-sm italic">No skills listed</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}

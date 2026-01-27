
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Service } from "@/types";
import ServiceCard from "@/components/services/ServiceCard";
import PostServiceForm from "@/components/services/PostServiceForm";
import { Plus, X, Wrench } from "lucide-react";

export default function ServicesPage() {
    useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "services"), orderBy("postedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const servicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Service[];
            setServices(servicesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 text-gradient bg-clip-text text-transparent">Local Services</h1>
                                <p className="text-slate-500 mt-1">Find skilled professionals or offer your services</p>
                            </div>

                            <button
                                onClick={() => setShowPostForm(!showPostForm)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full shadow-lg transition flex items-center justify-center gap-2"
                            >
                                {showPostForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {showPostForm ? "Cancel" : "Offer a Service"}
                            </button>
                        </div>

                        {/* Post Service Form */}
                        {showPostForm && (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <PostServiceForm onSuccess={() => setShowPostForm(false)} />
                            </div>
                        )}

                        {/* Services List */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Wrench className="w-8 h-8 text-slate-300 animate-spin" />
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-slate-700">No services yet</h3>
                                <p className="text-slate-500">Be the first to offer a service in your area!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map(service => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

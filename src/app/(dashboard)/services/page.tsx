"use client";

import { useState, useEffect } from "react";
import ServiceCard from "@/components/services/ServiceCard";
import PostServiceForm from "@/components/services/PostServiceForm";
import { Search, MapPin, Filter, Plus, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function ServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [filterCity, setFilterCity] = useState("New York, NY");
    const [showPostForm, setShowPostForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServices(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredServices = services.filter(service =>
        service.location?.toLowerCase().includes(filterCity.toLowerCase()) || filterCity === ""
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Local Services</h1>
                    <p className="text-slate-500 mt-2">Find trusted professionals near you.</p>
                </div>

                {user && (
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-md transition"
                    >
                        {showPostForm ? "Cancel" : <><Plus className="w-5 h-5" /> List Your Service</>}
                    </button>
                )}
            </div>

            {showPostForm && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <PostServiceForm onSuccess={() => setShowPostForm(false)} />
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search services..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none" />
                </div>
                <div className="md:w-1/3 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="City" className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none" />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> :
                    filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No services found here.</p>
                            <button onClick={() => setFilterCity("")} className="mt-2 text-blue-600 font-medium hover:underline">View all</button>
                        </div>
                    )}
            </div>
        </div>
    );
}

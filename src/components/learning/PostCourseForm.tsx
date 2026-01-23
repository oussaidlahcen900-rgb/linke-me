"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Building, MapPin, Calendar, Clock, DollarSign, Loader2 } from "lucide-react";

export default function PostCourseForm({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        provider: "",
        description: "",
        location: "Online",
        date: "",
        duration: "",
        price: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            await addDoc(collection(db, "courses"), {
                ...formData,
                authorId: user.uid,
                createdAt: serverTimestamp(),
            });
            onSuccess();
        } catch (error) {
            console.error("Error posting course:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<any>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Add a Training / Course</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="title" required value={formData.title} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Intro to Python" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider / Instructor</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="provider" required value={formData.provider} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Local Code Academy" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="location" required value={formData.location} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Online or 123 Main St" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="date" type="text" value={formData.date} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Oct 15th" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="duration" value={formData.duration} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. 4 weeks" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="price" value={formData.price} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Free or $50" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]" placeholder="What will be taught?" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "List Course"}
            </button>
        </form>
    );
}

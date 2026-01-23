"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User, MapPin, Phone, Tag, AlignLeft, Loader2 } from "lucide-react";

export default function PostServiceForm({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "Home Services",
        description: "",
        location: "",
        phone: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            await addDoc(collection(db, "services"), {
                ...formData,
                authorId: user.uid,
                createdAt: serverTimestamp(),
            });
            onSuccess();
        } catch (error) {
            console.error("Error posting service:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<any>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-2">List a Service</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Name / Title</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. John's Plumbing" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none bg-white">
                            <option>Home Services</option>
                            <option>Education & Tutoring</option>
                            <option>Health & Wellness</option>
                            <option>IT & Design</option>
                            <option>Legal & Financial</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="location" required value={formData.location} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="City coverage" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100" placeholder="+1 234..." />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]" placeholder="Describe what you offer..." />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "List Service"}
            </button>
        </form>
    );
}

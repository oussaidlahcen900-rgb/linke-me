
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, MapPin, DollarSign, Phone } from "lucide-react";

export default function PostServiceForm({ onSuccess }: { onSuccess: () => void }) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "Home Repair",
        location: profile?.city || "",
        price: "",
        description: "",
        contactPhone: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "services"), {
                ...formData,
                providerName: profile?.displayName || user.displayName || "Anonymous",
                authorId: user.uid,
                postedAt: serverTimestamp()
            });
            setFormData({
                title: "",
                category: "Home Repair",
                location: profile?.city || "",
                price: "",
                description: "",
                contactPhone: ""
            });
            onSuccess();
        } catch (error) {
            console.error("Error posting service:", error);
            alert("Failed to post service. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "Home Repair", "Cleaning", "Tutoring", "Web Design",
        "Photography", "Fitness", "Beauty", "Transport", "Other"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Title</label>
                <input
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                    placeholder="e.g. Expert Plumbing Repairs"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price / Rate</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                            placeholder="e.g. $50/hr"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                            placeholder="City, Area"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="contactPhone"
                            required
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
                    placeholder="Describe your service in detail..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Post Service"}
            </button>
        </form>
    );
}

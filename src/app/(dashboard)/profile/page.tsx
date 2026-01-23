"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Loader2, Save, X } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        displayName: "",
        city: "",
        bio: "",
        role: "Member"
    });

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile(data);
                    setEditForm({
                        displayName: data.displayName || "",
                        city: data.city || "",
                        bio: data.bio || "",
                        role: data.role || "Member"
                    });
                }
                setLoading(false);
            };
            fetchProfile();
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                displayName: editForm.displayName,
                city: editForm.city,
                bio: editForm.bio,
            }); // Not allowing role update freely in real app usually

            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

    if (!user || !profile) return <div className="text-center py-20">Please log in to view profile.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            {isEditing ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 fade-in animate-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                            <input value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                            <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]" />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg mr-2">Cancel</button>
                            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Save className="w-4 h-4" /> Save Changes</button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <ProfileHeader
                        profile={{
                            displayName: profile.displayName,
                            email: profile.email,
                            city: profile.city,
                            photoURL: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                            role: profile.role,
                            bio: profile.bio,
                            joinedAt: new Date(profile.createdAt).toLocaleDateString(),
                            onEdit: () => setIsEditing(true)
                        }}
                    />

                    {/* DEBUG: Temporary Admin Button */}
                    <div className="mt-8 p-4 border border-dashed border-red-200 rounded-xl bg-red-50 text-center">
                        <p className="text-sm text-red-600 mb-2 font-medium">Debug Area (For Testing Only)</p>
                        <button
                            onClick={async () => {
                                if (confirm("Make yourself Admin?")) {
                                    await updateDoc(doc(db, "users", user.uid), { role: "admin" });
                                    window.location.reload(); // Reload to refresh context
                                }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-semibold transition"
                        >
                            🛡️ Force Become Admin
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { UserProfile } from "@/types";
import { X, Loader2, Linkedin, Github, Twitter, Globe, User, Briefcase, MapPin, Camera, Sparkles, ShieldCheck } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useAuth } from "@/context/AuthContext"; // Need user object for deleteUser
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import AvatarPicker from "@/components/ui/AvatarPicker";
import ImageUpload from "@/components/ui/ImageUpload";
import clsx from "clsx";

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
}

export default function EditProfileDialog({ isOpen, onClose, profile }: EditProfileDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<"basic" | "work" | "social" | "account">("basic");
    const [skillInput, setSkillInput] = useState("");
    const { user } = useAuth();

    // Photo State
    const [photoMode, setPhotoMode] = useState<"upload" | "avatar">("upload");
    const [selectedAvatar, setSelectedAvatar] = useState(profile.photoURL || "");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        displayName: profile.displayName || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        city: profile.city || "",
        role: profile.role || "",
        experience: profile.experience || "",
        skills: profile.skills || [] as string[],
        socialLinks: {
            linkedin: profile.socialLinks?.linkedin || "",
            github: profile.socialLinks?.github || "",
            twitter: profile.socialLinks?.twitter || "",
            website: profile.socialLinks?.website || ""
        },
        hideBio: profile.hideBio || false
    });

    if (!isOpen) return null;

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Use a free reverse geocoding API (BigDataCloud is a good free option for client-side)
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();

                if (data.city || data.locality) {
                    setFormData(prev => ({ ...prev, city: data.city || data.locality }));
                } else {
                    alert("Could not detect city name.");
                }
            } catch (error) {
                console.error("Error fetching location:", error);
                alert("Failed to fetch location name.");
            } finally {
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location.");
            setIsLoading(false);
        });
    };

    const handleDeleteAccount = async () => {
        if (!confirm("WARNING: This will permanently delete your account, posts, and data.\n\nType 'DELETE' to confirm.")) {
            return;
        }

        // In a real app, re-authenticate here.
        setIsLoading(true);
        try {
            // 1. Delete Firestore Data (User doc)
            // Note: Posts/Comments should ideally be deleted via Cloud Functions trigger to avoid client-side complexity/permission issues
            await deleteDoc(doc(db, "users", profile.uid));

            // 2. Delete Auth User
            await deleteUser(user!);

            onClose();
            // AuthContext will handle redirect to login
        } catch (error: any) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("For security, please sign out and sign in again to delete your account.");
            } else {
                alert("Failed to delete account. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalPhotoURL = profile.photoURL;

            // Handle Photo Update
            if (photoMode === "upload" && imageFile) {
                const storageRef = ref(storage, `avatars/${profile.uid}_${Date.now()}`);
                await uploadBytes(storageRef, imageFile);
                finalPhotoURL = await getDownloadURL(storageRef);
            } else if (photoMode === "avatar" && selectedAvatar) {
                finalPhotoURL = selectedAvatar;
            }

            const userRef = doc(db, "users", profile.uid);
            await updateDoc(userRef, {
                photoURL: finalPhotoURL,
                displayName: formData.displayName,
                headline: formData.headline,
                bio: formData.bio,
                city: formData.city,
                role: formData.role,
                experience: formData.experience,
                skills: formData.skills,
                socialLinks: formData.socialLinks,
                hideBio: formData.hideBio
            });
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar / Top Navigation (Mobile friendly: Make it top nav on mobile, sidebar on desktop?) 
                        Let's stick to a clean top tab system for simplicity in dialogs */}
                </div>

                {/* Internal Tabs */}
                <div className="flex border-b border-slate-100 px-6 shrink-0 bg-slate-50/50">
                    <button
                        onClick={() => setActiveSection("basic")}
                        className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeSection === "basic" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <User className="w-4 h-4" /> Basic (& Photo)
                    </button>
                    <button
                        onClick={() => setActiveSection("work")}
                        className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeSection === "work" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <Briefcase className="w-4 h-4" /> Work & Skills
                    </button>
                    <button
                        onClick={() => setActiveSection("social")}
                        className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeSection === "social" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <MapPin className="w-4 h-4" /> Location & Social
                    </button>
                    <button
                        onClick={() => setActiveSection("account")}
                        className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeSection === "account" ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Account
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">

                    {activeSection === "basic" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

                            {/* Photo Picker Section */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Profile Photo</label>

                                <div className="flex gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setPhotoMode("upload")}
                                        className={clsx(
                                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition",
                                            photoMode === "upload" ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "text-slate-500 hover:bg-white/50"
                                        )}
                                    >
                                        <Camera className="w-4 h-4" /> Upload Photo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhotoMode("avatar")}
                                        className={clsx(
                                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition",
                                            photoMode === "avatar" ? "bg-white text-purple-600 shadow-sm border border-purple-100" : "text-slate-500 hover:bg-white/50"
                                        )}
                                    >
                                        <Sparkles className="w-4 h-4" /> Choose Character
                                    </button>
                                </div>

                                {photoMode === "upload" ? (
                                    <ImageUpload
                                        onImageSelected={setImageFile}
                                        onClear={() => setImageFile(null)}
                                        currentImage={profile.photoURL}
                                        label="Click to upload new photo"
                                    />
                                ) : (
                                    <AvatarPicker
                                        currentAvatar={selectedAvatar}
                                        onSelect={setSelectedAvatar}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="e.g. Sarah Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                                    <input
                                        type="text"
                                        value={formData.headline}
                                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="e.g. Full Stack Developer at Tech Co."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">A short description often displayed next to your name.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        maxLength={250}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1 text-right">{formData.bio.length}/250</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "work" && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="e.g. Senior Designer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                                    <select
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="Entry">Entry Level</option>
                                        <option value="Mid">Mid Level</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                                <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition min-h-[50px] flex flex-wrap gap-2">
                                    {formData.skills.map((skill, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium flex items-center gap-1">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={addSkill}
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-1"
                                        placeholder="Type skill & press Enter"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "social" && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location (City)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="e.g. New York, NY"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition flex items-center gap-2 whitespace-nowrap"
                                        title="Auto-detect Location"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        <span className="hidden sm:inline">Auto-Detect</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-sm font-bold text-slate-900 uppercase tracking-wider">Social Profiles</div>

                            <div className="space-y-3">
                                <div className="relative group">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition" />
                                    <input
                                        type="text"
                                        value={formData.socialLinks.linkedin}
                                        onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                                        className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="LinkedIn URL"
                                    />
                                </div>
                                <div className="relative group">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition" />
                                    <input
                                        type="text"
                                        value={formData.socialLinks.github}
                                        onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                                        className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="GitHub URL"
                                    />
                                </div>
                                <div className="relative group">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition" />
                                    <input
                                        type="text"
                                        value={formData.socialLinks.website}
                                        onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                                        className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                        placeholder="Personal Website URL"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </form>

                {activeSection === "account" && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-blue-900 mb-2">Account Status</h3>
                            <p className="text-sm text-blue-700">Your account is active. You are a member of the Linke-Me community.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Privacy Settings</h3>
                                <p className="text-xs text-slate-500 mt-1">Hide your bio and details from public view.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hideBio}
                                    onChange={(e) => setFormData({ ...formData, hideBio: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700">{formData.hideBio ? 'Hidden' : 'Visible'}</span>
                            </label>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-900">Delete Account</p>
                                    <p className="text-xs text-red-700 mt-0.5">Permanently remove your account and all data.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div >
    );
}

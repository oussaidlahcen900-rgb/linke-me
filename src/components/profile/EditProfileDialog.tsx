"use client";

import { useState } from "react";
import { UserProfile } from "@/types";
import { X, Loader2, Linkedin, Github, Twitter, Globe, User, Briefcase, MapPin, Camera, Sparkles } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
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
    const [activeSection, setActiveSection] = useState<"basic" | "work" | "social">("basic");
    const [skillInput, setSkillInput] = useState("");

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
        }
    });

    if (!isOpen) return null;

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
                socialLinks: formData.socialLinks
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
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50/50 focus:bg-white"
                                    placeholder="e.g. New York, NY"
                                />
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
        </div>
    );
}

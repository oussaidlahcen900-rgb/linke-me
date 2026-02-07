"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Image as ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadFile } from "@/lib/storageUtils";
import { GradientText } from "@/components/ui/GradientText";
import clsx from "clsx";

import { useLanguage } from "@/context/LanguageContext";

export default function CreatePost() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user, profile } = useAuth();
    const { t } = useLanguage();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // ... clearFile and handleSubmit (unchanged logic) ...
    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!text.trim() && !selectedFile) return;

        setLoading(true);
        try {
            let imageUrl = "";
            if (selectedFile) {
                const path = `posts/${user.uid}/${Date.now()}_${selectedFile.name}`;
                imageUrl = await uploadFile(selectedFile, path);
            }

            await addDoc(collection(db, "posts"), {
                text,
                imageUrl,
                authorId: user.uid,
                authorName: profile?.displayName || user.displayName || "Unknown User",
                authorAvatar: profile?.photoURL || user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                authorVerified: profile?.isVerified || false,
                likes: 0,
                createdAt: serverTimestamp(),
            });

            setText("");
            clearFile();
            setIsFocused(false);
        } catch (error) {
            console.error("Error adding post: ", error);
            // In a real app, show a toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={clsx(
                "bg-white rounded-2xl shadow-sm border transition-all duration-300 mb-8 overflow-hidden",
                isFocused ? "shadow-md border-blue-200 ring-2 ring-blue-50/50" : "border-slate-100 hover:border-slate-200"
            )}
        >
            <div className="p-1.5 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    {t('shareThoughts')}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
                <div className="flex gap-4">
                    <img
                        src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                        alt="User"
                        className="w-11 h-11 rounded-full bg-slate-100 object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => !text && !selectedFile && setIsFocused(false)}
                            placeholder={t('whatsHappening')}
                            className="w-full resize-none border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-lg min-h-[80px] bg-transparent p-0 leading-relaxed"
                        />

                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="relative mt-3 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-60 rounded-xl object-cover border border-slate-100 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50">
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    <span>{t('photo')}</span>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={(!text.trim() && !selectedFile) || loading}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-white shadow-sm transition-all duration-200",
                                    (!text.trim() && !selectedFile) || loading
                                        ? "bg-slate-300 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95"
                                )}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>{t('postButton')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

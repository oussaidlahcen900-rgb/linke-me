"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Image as ImageIcon, Loader2, X, Video, Calendar, Newspaper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadFile } from "@/lib/storageUtils";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";

export default function CreatePost() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user, profile } = useAuth();
    const { t } = useLanguage();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsExpanded(true);
        }
    };

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
            setIsExpanded(false);
        } catch (error) {
            console.error("Error adding post: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4">
            <div className="p-4">
                <div className="flex gap-3">
                    <img
                        src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={clsx(
                                "w-full text-left px-5 py-3 rounded-full border border-slate-300 font-medium text-slate-500 hover:bg-slate-100 transition-colors bg-white",
                                isExpanded ? "hidden" : "block"
                            )}
                        >
                            Start a post
                        </button>

                        {isExpanded && (
                            <form onSubmit={handleSubmit} className="animate-in fade-in duration-200">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={t('whatsHappening')}
                                    autoFocus
                                    className="w-full resize-none border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-lg min-h-[100px] bg-transparent p-2 leading-relaxed"
                                />

                                {/* Image Preview */}
                                {previewUrl && (
                                    <div className="relative mt-2 mb-4">
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

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
                                            <ImageIcon className="w-5 h-5 text-blue-500" />
                                        </button>
                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsExpanded(false);
                                                setText("");
                                                clearFile();
                                            }}
                                            className="px-4 py-1.5 text-slate-600 font-medium hover:bg-slate-100 rounded-full transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={(!text.trim() && !selectedFile) || loading}
                                            className={clsx(
                                                "px-5 py-1.5 rounded-full font-bold text-white transition-all shadow-sm flex items-center gap-2",
                                                (!text.trim() && !selectedFile) || loading
                                                    ? "bg-slate-300 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            )}
                                        >
                                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Buttons Row (Only visible when not expanded to mimic LinkedIn) */}
            {!isExpanded && (
                <div className="px-4 pb-2 flex justify-between items-center">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition flex-1 justify-center group">
                        <ImageIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-600">Photo</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition flex-1 justify-center group">
                        <Video className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-600">Video</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition flex-1 justify-center group">
                        <Newspaper className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-600">Article</span>
                    </button>
                </div>
            )}
        </div>
    );
}

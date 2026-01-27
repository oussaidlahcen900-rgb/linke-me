"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/ui/ImageUpload";
import { uploadFile } from "@/lib/storageUtils";

export default function CreatePost() {


    // ... inside component
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const { user, profile } = useAuth(); // Get real user

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!text.trim() && !selectedFile) return;

        setLoading(true);
        try {
            let imageUrl = "";
            if (selectedFile) {
                // Upload image first
                const path = `posts/${user.uid}/${Date.now()}_${selectedFile.name}`;
                imageUrl = await uploadFile(selectedFile, path);
            }

            await addDoc(collection(db, "posts"), {
                text,
                imageUrl, // Now a real URL from storage
                authorId: user.uid,
                authorName: profile?.displayName || user.displayName || "Unknown User",
                authorAvatar: profile?.photoURL || user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                likes: 0,
                createdAt: serverTimestamp(),
            });

            setText("");
            setSelectedFile(null);
            setShowImageUpload(false);
        } catch (error) {
            console.error("Error adding post: ", error);
            alert("Failed to post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <img
                        src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                        alt="User"
                        className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                    />
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What's happening in your city?"
                            className="w-full resize-none border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-lg min-h-[80px]"
                        />

                        {showImageUpload && (
                            <div className="mb-4">
                                <ImageUpload
                                    onImageSelected={setSelectedFile}
                                    onClear={() => setSelectedFile(null)}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowImageUpload(!showImageUpload)}
                                className={`p-2 rounded-full transition ${showImageUpload ? 'bg-blue-50 text-blue-500' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            <button
                                type="submit"
                                disabled={(!text.trim() && !selectedFile) || loading}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );

}

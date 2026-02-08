"use client";

import { X, Copy, Download, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    city?: string;
}

export default function ShareDialog({ isOpen, onClose, city }: ShareDialogProps) {
    if (!isOpen) return null;

    const url = typeof window !== "undefined" ? window.location.origin : "https://linke-me.vercel.app";
    const title = city ? `Linke-Me: The Social Network for ${city}` : "Linke-Me: Your Local Social Network";
    const description = "Connect with neighbors, find local jobs, and offer your services. The social network built for community. Join today!";

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    const handleCopyText = () => {
        const text = `${title}\n\n${description}\n\nJoin here: ${url}`;
        navigator.clipboard.writeText(text);
        alert("Announcement text copied!");
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative max-h-[90vh]">

                {/* Desktop Close Button (inside) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition z-[60] backdrop-blur-md border border-white/20 shadow-lg hidden md:block"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 drop-shadow-md" />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white relative">
                        <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-4">
                            <QRCodeCanvas
                                value={url}
                                size={160}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <h2 className="text-xl font-bold mb-1">Scan to Join</h2>
                        <p className="text-blue-100 text-sm">Share this code with your community</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Announcement Text</h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
                                <p className="font-bold text-slate-900 mb-1">{title}</p>
                                <p>{description}</p>
                                <p className="mt-2 text-blue-600 font-medium">{url}</p>
                            </div>
                            <button
                                onClick={handleCopyText}
                                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy Text for Social Media
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Link
                            </button>
                            <button
                                onClick={async () => {
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: title,
                                                text: description,
                                                url: url
                                            });
                                        } catch (err) {
                                            console.error("Share failed", err);
                                        }
                                    } else {
                                        handleCopyLink();
                                    }
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                            >
                                <Share2 className="w-4 h-4" />
                                Share App
                            </button>
                        </div>

                        {/* Bottom Close Button (Fallback) */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-slate-500 font-medium hover:text-slate-800 transition border-t border-slate-100 mt-2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Close Button (Fixed to Viewport) */}
            <button
                onClick={onClose}
                className="fixed top-4 right-4 p-3 bg-white text-slate-900 rounded-full z-[100] shadow-2xl border-2 border-slate-100 md:hidden active:scale-95 transition"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
    );

}
